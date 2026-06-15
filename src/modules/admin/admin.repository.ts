import { query } from "../../database/connection.js";
import { AuditPayload } from "./interfaces/audit.interface.js";
import { Hospital } from "./interfaces/hospital.interface.js";

export class AdminRepository{

    async fetchDoctorsByHospitalId(hospital_id:number){
        const rows = await query(
            `
            select * from doctors where hospital_id=? 
            `,[hospital_id]
        );
         return rows ;
    }

    async fetchHospitalIdFromAdminId(user_id:number){
        const rows:any = await query(`select hospital_id from admins where user_id= ?`,[user_id]);
        return rows[0];
    }

    async fetchPatientsByHospital(hospital_id: number) {
    const rows= await query(
      `SELECT DISTINCT p.*
FROM patients p
JOIN appointments a  ON p.patient_id  = a.patient_id
JOIN doctors d       ON a.doctor_id   = d.doctor_id
WHERE d.hospital_id  = ? `, 
      [hospital_id]
    );
    return rows;
  }

  async insertDoctorQualifications(
  doctor_id: number,
  qualifications: { degree: string; college_name: string; graduation_year: number }[]
): Promise<void> {
  for (const q of qualifications) {
    await query(
      `INSERT INTO doctor_qualifications (doctor_id, degree, graduation_year, college_name)
       VALUES (?, ?, ?, ?)`,
      [
        Number(doctor_id),
        String(q.degree),
        q.graduation_year ? Number(q.graduation_year) : null,
        q.college_name    ? String(q.college_name)    : null,
      ]
    );
  }
}

  async insertDoctorSpecialties(
  doctor_id: number,
  specialties: number[]
): Promise<void> {
  for (const specialty_id of specialties) {
    await query(
      `INSERT INTO doctor_specialties (doctor_id, specialty_id)
       VALUES (?, ?)`,
      [Number(doctor_id), Number(specialty_id)]
    );
  }
} 

 async getDoctorById(doctor_id: number) {
  // Basic doctor + user info
  const rows: any = await query(
    `SELECT
       d.*,
       u.email,
       u.role,
       u.is_active,
       u.is_email_verified
     FROM doctors d
     JOIN users u ON d.user_id = u.user_id
     WHERE d.doctor_id = ?`,
    [doctor_id]
  );

  if (!rows[0]) return null;

  const doctor = rows[0];

  // Specialties
  const specialties = await query(
    `SELECT s.specialty_id, s.specialty_name
     FROM doctor_specialties ds
     JOIN specialties s ON ds.specialty_id = s.specialty_id
     WHERE ds.doctor_id = ?`,
    [doctor_id]
  );

  // Qualifications
  const qualifications = await query(
    `SELECT qualification_id, degree, college_name, graduation_year
     FROM doctor_qualifications
     WHERE doctor_id = ?`,
    [doctor_id]
  );

  // Attach to doctor object
  doctor.specialties    = specialties;
  doctor.qualifications = qualifications;

  return doctor;
}

// admin.repo.ts
async editDoctor(doctor_id: number, data: any) {
  await query(
    `UPDATE doctors
     SET
       first_name        = ?,
       last_name         = ?,
       gender            = ?,
       experience_years  = ?,
       consultation_fee  = ?,
       bio               = ?,
       joined_at         = ?,
       is_deactivated    = ?
     WHERE doctor_id = ?`,
    [
      data.first_name,
      data.last_name,
      data.gender            ?? null,
      data.experience_years  ?? null,
      data.consultation_fee  ?? null,
      data.bio               ?? null,
      data.joined_at         ?? null,
      data.is_deactivated    ?? false,
      doctor_id,
    ]
  );

  // Return the updated doctor with all details
  return await this.getDoctorById(doctor_id);
}
  async addAuditLogs(payload:AuditPayload){
    const rows = await query(`Insert into audit_logs (performed_by_user_id,action,entity_name,entity_id,ip_address) values (?,?,?,?,?)`,[payload.performed_by_user_id,payload.action,payload.entity_name,payload.entity_id,payload.ip_address ?? null]);
    return rows;
  }

  async showLogs(hospital_id:number){
    const rows = await query(`
      
      SELECT
  al.audit_id,
  al.action,
  al.entity_name,
  al.entity_id, 
  al.ip_address,
  al.created_at,
  u.email     AS performed_by_email,
  u.role      AS performed_by_role,
  CONCAT(
    COALESCE(a.first_name, d.first_name, 'Unknown'),
    ' ',
    COALESCE(a.last_name,  d.last_name,  '')
  )           AS performed_by_name

FROM audit_logs al
LEFT JOIN users   u ON al.performed_by_user_id = u.user_id
LEFT JOIN admins  a ON u.user_id = a.user_id  AND a.hospital_id = ?
LEFT JOIN doctors d ON u.user_id = d.user_id  AND d.hospital_id = ?

WHERE (
  a.hospital_id = ?  
  OR
  d.hospital_id = ? 
)

ORDER BY al.created_at DESC
      
      `,[hospital_id,hospital_id,hospital_id,hospital_id])
  }


  async fetchAppointments(hospital_id:number){
    const rows = await query(`SELECT 
    a.appointment_id,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    a.start_time,
    a.appointment_type,
    a.appointment_status,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name
FROM appointments a 
INNER JOIN doctors d ON a.doctor_id = d.doctor_id 
LEFT JOIN patients p ON a.patient_id = p.patient_id
WHERE d.hospital_id = ?; `,[hospital_id]);
 return rows;
  };
 
async fetchAuditLogs(hospital_id:number){
  const rows = await query(`
    SELECT
  al.audit_id,
  al.action,
  al.entity_name,
  al.entity_id,
  al.ip_address,
  al.created_at,
  u.email    AS performed_by_email,
  u.role     AS performed_by_role,
  CONCAT(
    COALESCE(adm.first_name, doc.first_name, pat.first_name, 'Unknown'),
    ' ',
    COALESCE(adm.last_name,  doc.last_name,  pat.last_name,  '')
  )          AS performed_by_name

FROM audit_logs al
LEFT JOIN users   u   ON al.performed_by_user_id = u.user_id

-- check if user is admin of this hospital
LEFT JOIN admins  adm ON u.user_id = adm.user_id AND adm.hospital_id =?

-- check if user is doctor of this hospital
LEFT JOIN doctors doc ON u.user_id = doc.user_id AND doc.hospital_id = ?

-- check if user is a patient who has visited this hospital
-- patient → appointments → doctor → hospital
LEFT JOIN patients pat ON u.user_id = pat.user_id
LEFT JOIN appointments apt ON apt.patient_id = pat.patient_id
LEFT JOIN doctors doc2 ON apt.doctor_id = doc2.doctor_id AND doc2.hospital_id = ?

WHERE (
  adm.hospital_id  = ?   -- is admin of this hospital
  OR doc.hospital_id = ?  -- is doctor of this hospital
  OR doc2.hospital_id = ?  -- is patient who visited this hospital
)

GROUP BY al.audit_id   -- prevent duplicate rows from patient multi-appointments

ORDER BY al.created_at DESC
    `,[hospital_id,hospital_id,hospital_id,hospital_id,hospital_id,hospital_id]);
    return rows;
}

async fetchSpecialties(){
const specialties = await query(`select * from specialties`,[]);
return specialties;
}

async updateDoctorStatus(doctorId: number, is_deactivated: number) {
        const result = await query(
            `
            update doctors set is_deactivated = ? where doctor_id = ?
            `, [is_deactivated, doctorId]
        );
        return result;
    }

    async fetchPatientDetailsById(patient_id:number){
      const patient = await query(`select * from patients where patient_id = ?`,[patient_id]);
      return patient;
    }

    async fetchHospitalDetails(hospital_id:number){
      const hospital = await query(`select * from hospitals where hospital_id = ?`,[hospital_id]);
      return hospital;
    }

    async updateSettings(hospital_id:number,payload:Hospital){
      const hospital = await query(`update hospitals set hospital_name = ?,email=?,address_line1=?,address_line2=?,contact_number=? where hospital_id = ?`,[payload.hospital_name,payload.email,payload.address_line1,payload.address_line2,payload.contact_number,hospital_id]);
      return hospital;
    }

    async fetchStatsOfHospital(hospital_id:number){
     const stats = await query(`
      SELECT 
    -- 1. Today's Appointments vs Yesterday's Appointments
    COUNT(CASE WHEN DATE(a.start_time) = CURRENT_DATE() THEN 1 END) AS today_appointments,
    COUNT(CASE WHEN DATE(a.start_time) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) THEN 1 END) AS yesterday_appointments,

    -- 2. Total Active Patients vs Registered Patients Yesterday
    COUNT(DISTINCT CASE WHEN p.created_at <= NOW() THEN p.patient_id END) AS active_patients,
    COUNT(DISTINCT CASE WHEN p.created_at < CURRENT_DATE() THEN p.patient_id END) AS patients_yesterday,

    -- 3. Today's Revenue vs Yesterday's Revenue
    COALESCE(SUM(CASE WHEN DATE(a.start_time) = CURRENT_DATE() AND a.appointment_status = 'COMPLETED' THEN d.consultation_fee ELSE 0 END), 0) AS revenue_today,
    COALESCE(SUM(CASE WHEN DATE(a.start_time) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND a.appointment_status = 'COMPLETED' THEN d.consultation_fee ELSE 0 END), 0) AS revenue_yesterday,

    -- 4. Active Doctors vs Total Doctors Registered Yesterday
    COUNT(DISTINCT CASE WHEN d.is_deactivated = FALSE THEN d.doctor_id END) AS active_doctors,
    COUNT(DISTINCT CASE WHEN d.created_at < CURRENT_DATE() THEN d.doctor_id END) AS doctors_yesterday

FROM doctors d
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
LEFT JOIN patients p ON a.patient_id = p.patient_id
WHERE d.hospital_id = ?;
      `,[hospital_id]) ;
      return stats;
    } 


}