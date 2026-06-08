import { query } from "../../database/connection.js";

export interface PatientSchema {
  patient_id: string;

  user_id: number;

  first_name: string;
  last_name: string;

  country_code: string;
  mobile: string;

  address_line1?: string | null;
  address_line2?: string | null;

  blood_group?: string | null;

  profile_path?: string | null;

  dob: Date;

  gender: "MALE" | "FEMALE" | "OTHER";

  is_insured: boolean;

  created_at: Date;

  updated_at: Date;
}

type SearchDoctorsFilters = {
  name?: string | undefined;
  specialty?: string | undefined;
  gender?: string | undefined;
  hospitalId?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
};

type UpdatePatientProfileDto = Partial<
  Pick<
    PatientSchema,
    | "first_name"
    | "last_name"
    | "address_line1"
    | "address_line2"
    | "blood_group"
    | "profile_path"
    | "is_insured"
  >
>;

export class PatientRepository {
  async getPatientByUserId(userId: number) {
    const rows: any = await query(
      "select p.*, u.email, u.is_active, u.is_email_verified from patients p join users u on p.user_id = u.user_id where p.user_id = ?",
      [userId],
    );
    console.log(rows);

    return rows[0];
  }

  async getPatientIdByUserId(userId: number) {
    const rows: any = await query(
      `select patient_id from patients where user_id = ?`,
      [userId],
    );

    return rows[0]?.patient_id ?? null;
  }

  async updateProfile(patientId: string, data: UpdatePatientProfileDto) {
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined,
    );

    if (!entries.length) {
      return;
    }

    const fields = entries.map(([key]) => `${key} = ?`).join(", ");

    const values = entries.map(([, value]) => value);

    return query(
      `
        UPDATE patients
        SET ${fields},
            updated_at = UTC_TIMESTAMP()
        WHERE patient_id = ?
        `,
      [...values, patientId],
    );
  }

  async getFamilyMembers(patientId: number) {
    return query(
      "select * from family_members where patient_id = ? order by created_at asc",
      [patientId],
    );
  }

  async addFamilyMember(
    patientId: number,
    data: {
      relation: string;
      firstName: string;
      lastName: string;
      dob?: string;
      mobile?: string;
      email?: string;
    },
  ) {
    const result: any = await query(
      `insert into  family_members (patient_id, relation, first_name, last_name, dob, mobile, email)
       values (?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        data.relation,
        data.firstName,
        data.lastName,
        data.dob ?? null,
        data.mobile ?? null,
        data.email ?? null,
      ],
    );
    console.log(result);
    return result;
  }

  async updateFamilyMember(
    memberId: number,
    patientId: number,
    data: Partial<{
      relation: string;
      first_name: string;
      last_name: string;
      dob: string;
      mobile: string;
      email: string;
    }>,
  ) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return;
    const fields = entries.map(([k]) => `${k} = ?`).join(", ");
    const values = entries.map(([, v]) => v);
    return query(
      `update family_members set ${fields}, updated_at = UTC_TIMESTAMP()
       where member_id = ? and patient_id = ?`,
      [...values, memberId, patientId],
    );
  }

  async deleteFamilyMember(memberId: number, patientId: number) {
    return query(
      `delete from family_members where member_id = ? and patient_id = ?`,
      [memberId, patientId],
    );
  }

  async searchDoctors(filters: SearchDoctorsFilters) {
    const conditions: string[] = ["d.is_deactivated = FALSE"];
    const params: any[] = [];

    const name = filters.name?.trim();
    const specialty = filters.specialty?.trim();
    const gender = filters.gender?.trim();
    const hospitalId = filters.hospitalId;
    const limit = Number.isFinite(filters.limit)
      ? Math.max(1, Math.min(filters.limit as number, 50))
      : 20;
    const offset = Number.isFinite(filters.offset)
      ? Math.max(0, filters.offset as number)
      : 0;

    if (name) {
      conditions.push(`
      (
        d.first_name LIKE ?
        OR d.last_name LIKE ?
        OR CONCAT(d.first_name, ' ', d.last_name) LIKE ?
      )
    `);
      params.push(`%${name}%`, `%${name}%`, `%${name}%`);
    }

    if (specialty) {
      conditions.push("s.specialty_name LIKE ?");
      params.push(`%${specialty}%`);
    }

    if (gender) {
      conditions.push("d.gender = ?");
      params.push(gender.toUpperCase());
    }

    if (hospitalId) {
      conditions.push("d.hospital_id = ?");
      params.push(hospitalId);
    }

    const whereClause = conditions.join(" AND ");

    return query(
      `
    SELECT DISTINCT
      d.doctor_id,
      d.first_name,
      d.last_name,
      d.gender,
      d.experience_years,
      d.consultation_fee,
      d.currency_code,
      d.rating,
      d.bio,
      d.profile_path,
      h.hospital_name,
      GROUP_CONCAT(
        DISTINCT s.specialty_name
        ORDER BY s.specialty_name
        SEPARATOR ', '
      ) AS specialties
    FROM doctors d
    JOIN hospitals h
      ON d.hospital_id = h.hospital_id
    LEFT JOIN doctor_specialties ds
      ON d.doctor_id = ds.doctor_id
    LEFT JOIN specialties s
      ON ds.specialty_id = s.specialty_id
    WHERE ${whereClause}
    GROUP BY d.doctor_id
    ORDER BY COALESCE(d.rating, 0) DESC
    LIMIT ${limit} OFFSET ${offset}
    `,
      params,
    );
  }

  async getDoctorById(doctorId: number) {
    const rows: any = await query(
      `SELECT
         d.*,
         h.hospital_name, h.address_line1 AS hospital_address,
         GROUP_CONCAT(DISTINCT s.specialty_name ORDER BY s.specialty_name SEPARATOR ', ') AS specialties,
         GROUP_CONCAT(DISTINCT CONCAT(dq.degree, ' (', IFNULL(dq.graduation_year,''), ')') SEPARATOR ' | ') AS qualifications
       FROM doctors d
       JOIN hospitals h ON d.hospital_id = h.hospital_id
       LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
       LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
       LEFT JOIN doctor_qualifications dq ON d.doctor_id = dq.doctor_id
       WHERE d.doctor_id = ? AND d.is_deactivated = FALSE
       GROUP BY d.doctor_id`,
      [doctorId],
    );
    return rows[0] ?? null;
  }

  async isSlotTaken(
    doctorId: number,
    slotDate: string,
    startTime: string,
  ): Promise<boolean> {
    const rows: any = await query(
      `SELECT 1 FROM appointments
       WHERE doctor_id = ? AND slot_date = ? AND start_time = ?
         AND appointment_status NOT IN ('CANCELLED')
       LIMIT 1`,
      [doctorId, slotDate, startTime],
    );
    return rows.length > 0;
  }

  async getBookedSlots(doctorId: number, date: string): Promise<string[]> {
    const rows: any = await query(
      `SELECT TIME_FORMAT(start_time, '%H:%i') AS slot_time
FROM appointments
WHERE doctor_id = ? AND slot_date = ?
AND appointment_status NOT IN ('CANCELLED')`,
      [doctorId, date],
    );
    return rows.map((r: any) => r.slot_time);
  }

  async isDoctorOnLeave(doctorId: number, date: string): Promise<boolean> {
    const rows: any = await query(
      `SELECT 1 FROM doctor_leaves
WHERE doctor_id = ? AND ? BETWEEN from_date AND to_date LIMIT 1`,
      [doctorId, date],
    );
    return rows.length > 0;
  }

//   async getDoctorSchedule(doctorId: number) {
//     return query(
//       `SELECT * FROM doctor_schedules WHERE doctor_id = ?
// ORDER BY FIELD(working_day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')`,
//       [doctorId],
//     );
//   }
}
