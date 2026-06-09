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
    console.log(rows);
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

  // Doctor schedule helpers
  async getDoctorSchedule(doctorId: number) {
    return query(
      `SELECT * FROM doctor_schedules WHERE doctor_id = ?
ORDER BY FIELD(working_day,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')`,
      [doctorId],
    );
  }

  async createAppointment(data: {
    doctorId: number;
    patientId: number;
    slotDate: string;
    startTime: string;
    endTime: string;
    appointmentType: "IN_PERSON" | "TELEMEDICINE";
    chiefComplaint?: string | undefined;
    confirmationNo: string;
  }) {
    const result: any = await query(
      `INSERT INTO appointments
(doctor_id, patient_id, slot_date, start_time, end_time,
appointment_type, appointment_status, chief_complaint, confirmation_no)
VALUES (?, ?, ?, ?, ?, ?, 'PAYMENT_PENDING', ?, ?)`,
      [
        data.doctorId,
        data.patientId,
        data.slotDate,
        data.startTime,
        data.endTime,
        data.appointmentType,
        data.chiefComplaint ?? null,
        data.confirmationNo,
      ],
    );
    return result.insertId as number;
  }

  async createPayment(data: {
    appointmentId: number;
    amount: number;
    paymentMethod: string;
    status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
    transactionId: string;
  }) {
    const result: any = await query(
      `
      INSERT INTO payments (
        appointment_id,
        amount,
        currency,
        payment_method,
        transaction_id,
        status,
        refund_status,
        transaction_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.appointmentId,
        data.amount,
        "INR",
        data.paymentMethod,
        data.transactionId,
        data.status,
        0,
        new Date(),
      ],
    );

    return result.insertId;
  }

  async updateAppointmentStatus(appointmentId: number, status: string) {
    await query(
      `
      UPDATE appointments
      SET appointment_status = ?
      WHERE appointment_id = ?
    `,
      [status, appointmentId],
    );
  }

  async logStatusHistory(data: {
    appointmentId: number;
    oldStatus: string | null;
    newStatus: string;
    changedByUserId: number;
    remarks?: string;
  }) {
    return query(
      `INSERT INTO appointment_status_history
    (appointment_id, old_status, new_status, changed_by_user_id, remarks)
    VALUES (?, ?, ?, ?, ?)`,
      [
        data.appointmentId,
        data.oldStatus,
        data.newStatus,
        data.changedByUserId,
        data.remarks ?? null,
      ],
    );
  }
  async updatePaymentStatus(paymentId: number, status: string) {
    await query(
      `
        UPDATE payments
        SET payment_status=?
        WHERE payment_id=?
        `,
      [status, paymentId],
    );
  }
  // Appointment documents
  async addAppointmentDocument(
    appointmentId: number,
    documentName: string,
    documentPath: string,
  ) {
    return query(
      `INSERT INTO appointment_documents (appointment_id, document_name, document_path)
VALUES (?, ?, ?)`,
      [appointmentId, documentName, documentPath],
    );
  }

  // View appointments
  async getAppointmentsByPatient(patientId: number, status?: string) {
    const params: any[] = [patientId];
    let statusFilter = "";
    if (status) {
      statusFilter = "AND a.appointment_status = ?";
      params.push(status.toUpperCase());
    }
    return query(
      `SELECT
        a.appointment_id, a.slot_date, a.start_time, a.end_time,
        a.appointment_type, a.appointment_status, a.chief_complaint, a.confirmation_no,
        d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
        d.consultation_fee, d.currency_code, d.profile_path AS doctor_photo,
        h.hospital_name,
        GROUP_CONCAT(DISTINCT s.specialty_name SEPARATOR ', ') AS specialties,
        p.status AS payment_status, p.amount AS payment_amount
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN hospitals h ON d.hospital_id = h.hospital_id
        LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
        LEFT JOIN payments p ON a.appointment_id = p.appointment_id
        WHERE a.patient_id = ? ${statusFilter}
        GROUP BY a.appointment_id
        ORDER BY a.slot_date DESC, a.start_time DESC`,
      params,
    );
  }

  async getAppointmentById(appointmentId: number) {
    const rows: any = await query(
      `SELECT a.*,
d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
d.consultation_fee, d.currency_code
FROM appointments a
JOIN doctors d ON a.doctor_id = d.doctor_id
WHERE a.appointment_id = ?`,
      [appointmentId],
    );
    return rows[0] ?? null;
  }

  // Reschedule
  async rescheduleAppointment(
    appointmentId: number,
    data: {
      slotDate: string;
      startTime: string;
      endTime: string;
    },
  ) {
    return query(
      `UPDATE appointments
SET slot_date = ?, start_time = ?, end_time = ?,
appointment_status = 'CONFIRMED', updated_at = UTC_TIMESTAMP()
WHERE appointment_id = ?`,
      [data.slotDate, data.startTime, data.endTime, appointmentId],
    );
  }

  // Cancel Booking
  async cancelAppointment(appointmentId: number) {
    return query(
      `UPDATE appointments
SET appointment_status = 'CANCELLED', updated_at = UTC_TIMESTAMP()
WHERE appointment_id = ?`,
      [appointmentId],
    );
  }

  // Payments

  async failPayment(paymentId: number) {
    return query(
      `UPDATE payments SET status = 'FAILED', updated_at = UTC_TIMESTAMP()
WHERE payment_id = ?`,
      [paymentId],
    );
  }

  async initiateRefund(paymentId: number) {
    return query(
      `UPDATE payments
SET status = 'REFUNDED', refund_status = TRUE, updated_at = UTC_TIMESTAMP()
WHERE payment_id = ? AND status = 'SUCCESS'`,
      [paymentId],
    );
  }

  async getPaymentByAppointment(appointmentId: number) {
    const result: any = await query(
      `
      SELECT *
      FROM payments
      WHERE appointment_id = ?
      LIMIT 1
    `,
      [appointmentId],
    );

    return result[0] ?? null;
  }

  async markPaymentRefunded(paymentId: number) {
    await query(
      `
      UPDATE payments
      SET
        status = 'REFUNDED',
        refund_status = 1
      WHERE payment_id = ?
    `,
      [paymentId],
    );
  }

  async getPaymentHistory(patientId: number) {
    return query(
      `SELECT
        p.payment_id, p.amount, p.currency, p.payment_method,
        p.status, p.refund_status, p.transaction_id, p.transaction_at,
        a.slot_date, a.confirmation_no, a.appointment_type,
        d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
        FROM payments p
        JOIN appointments a ON p.appointment_id = a.appointment_id
        JOIN doctors d ON a.doctor_id = d.doctor_id
        WHERE a.patient_id = ?
        ORDER BY p.created_at DESC`,
      [patientId],
    );
  }

  //  Medical records
  async getMedicalHistory(patientId: number) {
    return query(
      `SELECT
            mr.record_id, mr.appointment_id, mr.diagnosis, mr.examination_notes,
            mr.created_at AS record_date,
            d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
            a.slot_date, a.appointment_type,
            pr.prescription_id, pr.notes AS prescription_notes,
            GROUP_CONCAT(
            DISTINCT CONCAT(pi.medicine_name,'|',pi.dosage,'|',pi.frequency,'|',pi.duration)
            SEPARATOR ';;'
            ) AS medicines
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.doctor_id
            JOIN appointments a ON mr.appointment_id = a.appointment_id
            LEFT JOIN prescriptions pr ON mr.record_id = pr.record_id
            LEFT JOIN prescription_items pi ON pr.prescription_id = pi.prescription_id
            WHERE mr.patient_id = ?
            GROUP BY mr.record_id
            ORDER BY mr.created_at DESC`,
      [patientId],
    );
  }

  async getMedicalRecordById(recordId: number, patientId: number) {
    const rows: any = await query(
      `SELECT
            mr.*,
            d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
            a.slot_date, a.start_time, a.appointment_type,
            pr.prescription_id, pr.notes AS prescription_notes
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.doctor_id
            JOIN appointments a ON mr.appointment_id = a.appointment_id
            LEFT JOIN prescriptions pr ON mr.record_id = pr.record_id
            WHERE mr.record_id = ? AND mr.patient_id = ?`,
      [recordId, patientId],
    );
    if (!rows[0]) return null;

    const prescriptionItems = await query(
      `SELECT pi.* FROM prescription_items pi
        JOIN prescriptions pr ON pi.prescription_id = pr.prescription_id
        WHERE pr.record_id = ?`,
      [recordId],
    );

    const attachments = await query(
      `SELECT * FROM medical_record_attachments WHERE record_id = ?`,
      [recordId],
    );

    return { ...rows[0], prescriptionItems, attachments };
  }

  // Notifications
  async getNotifications(patientId: number, unreadOnly: boolean) {
    const filter = unreadOnly ? "AND is_read = FALSE" : "";
    return query(
      `SELECT * FROM notifications
        WHERE user_id = ? ${filter}
        ORDER BY created_at DESC
        LIMIT 50`,
      [patientId],
    );
  }

  async markNotificationRead(notificationId: number, patientId: number) {
    return query(
      `UPDATE notifications SET is_read = TRUE, updated_at = UTC_TIMESTAMP()
WHERE notification_id = ? AND patient_id = ?`,
      [notificationId, patientId],
    );
  }

  async markAllNotificationsRead(patientId: number) {
    return query(
      `UPDATE notifications SET is_read = TRUE, updated_at = UTC_TIMESTAMP()
WHERE patient_id = ?`,
      [patientId],
    );
  }
  async createNotification(data: {
    userId: number;
    title: string;
    message: string;
  }) {
    const result: any = await query(
      `
      INSERT INTO notifications (
        user_id,
        notification_type,
        notification_message,
        sent_at
      )
      VALUES (?, ?, ?, UTC_TIMESTAMP())
    `,
      [data.userId, data.title, data.message],
    );

    return result.insertId;
  }
}
