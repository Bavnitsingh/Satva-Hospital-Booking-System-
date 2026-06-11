import { query } from "../../database/connection.js";
import { AuditPayload } from "./interfaces/audit.interface.js";

export class AdminRepository{

    async fetchDoctorsByHospitalId(hospital_id:number){
        const rows:any = await query(
            `
            select * from doctors where hospital_id=? 
            `,[hospital_id]
        );
         return rows.length > 0 ? rows : null;
    }

    async fetchHospitalIdFromAdminId(user_id:number){
        const rows : any = await query(`select hospital_id from admins where user_id= ?`,[user_id]);
        return rows[0];
    }

    async fetchPatientsByHospital(hospital_id: number) {
    const rows: any = await query(
      `SELECT DISTINCT p.* FROM patients p 
       LEFT JOIN appointments a ON p.id = a.patient_id 
       WHERE a.hospital_id = ? `, 
      [hospital_id]
    );
    return rows;
  }

  async getDoctorById(doctor_id:number){
    const rows : any = await query(`select * from doctors where doctor_id = ?`,[doctor_id]);
    return rows[0];
  }

  async editDoctor(doctor_id:number,data:any){
    const rows : any = await query(`Update doctors set first_name=?,last_name=?,gender=?,experience_years=?,consultation_fee=?,bio=? where doctor_id = ?`,[data.first_name,data.last_name,data.gender,data.experience_years,data.consultation_fee,data.bio,doctor_id]);
    console.log(rows[0]);
    return rows[0];
  }

  async addAuditLogs(payload:AuditPayload){
    const rows : any = await query(`Insert into audit_logs (performed_by_user_id,action,entity_name,entity_id,ip_address) values (?,?,?,?,?)`,[payload.performed_by_user_id,payload.action,payload.entity_name,payload.entity_id,payload.ip_address ?? null]);
    return rows;
  }

  async showLogs(hospital_id:number){
    const rows : any = await query(`
      
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
    const rows:any = await query(`SELECT 
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
  const rows : any = await query(`
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

}