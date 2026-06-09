import { query } from "../../database/connection.js";
import { IDoctorLeave, IDoctorSchedule, IMedicalAttachments, IMedicalRecordAmmendment, IMedicalRecords, IPrescriptionItems, IPrescriptions } from "./doctor.interface.js";

export class DoctorRepo {
  async findDoctorByUserID(user_id: number) {
    const rows: any = await query(
      `
            SELECT * from doctors where user_id=? `,
      [user_id],
    );

    return rows[0];
  }

  async findDoctorQualificationByDoctorID(doctor_id: number) {
    const rows: any = await query(
      `
            SELECT * FROM doctor_qualifications where 
            doctor_id=?`,
      [doctor_id],
    );

    return rows[0];
  }

  async findDoctorScheduleByDoctorID(doctor_id: number) {
    const rows: any = await query(
      `
            SELECT * FROM doctor_schedules
            where doctor_id=? and date_from=? and date_to=?`,
      [doctor_id],
    );

    return rows[0];
  }
  async findDoctorAppointments(doctor_id: number, slot_date: string) {
    const rows: any = await query(
      `
    with cte as(select a.appointment_id,a.slot_date,a.start_time,
    a.end_time,a.appointment_type,a.appointment_status,a.chief_complaint,
    a.confirmation_no,CONCAT(p.first_name,p.last_name) as 'patient name',p.patient_id 
    from appointments a 
    inner join patients p on a.patient_id=p.patient_id 
    where a.doctor_id=? and slot_date=?)
    select c.* , case 
    when c.appointment_status='TELEMEDICINE' then ts.meeting_link 
    else ''
    end as link
    from cte c inner join telemedicine_sessions ts on c.appointment_id=ts.appointment_id;`,
      [doctor_id, slot_date],
    );

    return rows[0];
  }


  async insertDoctorSchedule(data:IDoctorSchedule){
   
    const result:any=await query(
        `insert into doctor_schedules(doctor_id,working_day,working_from,working_to,
        date_from,date_to,slot_duration)
         values (?,?,?,?,?,?,?)`
    ,[data.doctor_id,
      data.working_day,
      data.working_from,
      data.working_to,
      data.date_from,
      data.date_to,
      data.slot_duration
    ])

    return result
  }


async insertDoctorLeaves(data:IDoctorLeave){

    const result:any=await query(
       `insert into doctor_leaves(doctor_id,from_date,to_date,reason)
        values(?,?,?,?)`,
        [
        data.doctor_id,
        data.from_date,
        data.to_date,
        data.reason
    ]
    )
}

async DoctorDashBoardData(doctor_id:number){


    const rows:any =await query(`    
    select 
	COUNT(a.appointment_status='CONFIRMED') as 'TOTAL APPOINTMENT',
    COUNT(a.appointment_status='CONFIRMED')-COUNT(a.appointment_status='COMPLETED') AS 'UPCOMING',
    COUNT(a.appointment_status='CANCELLED') AS 'CANCELLED',
    COUNT(a.appointment_status='RESCHEDULED') as 'RESCHEDULED'
    from appointments a inner join doctors d on a.doctor_id=d.doctor_id and a.slot_date=current_date where doctor_id=?;`,[doctor_id])


    return rows[0]

}


async DoctorNotification(doctor_id:number){


    const rows:any=await query(`
        select doctor_id,
        notification_type,
        notification_message,
        sent_at 
        notifications where doctor_id=? and is_read=FALSE
        `,[doctor_id])


        return rows[0]

}


async insertMedicalRecords(data:IMedicalRecords)
{


    const result:any =await query(`
        
        insert into medical_records(appointment_id_,doctor_id,patient_id,diagnosis,examination_notes)
        values(?,?,?,?,?)
        `,[
            data.appointment_id,
            data.doctor_id,
            data.patient_id,
            data.diagnosis,
            data.examination_notes
        ])

    return result[0]

}

async insertMedicalRecordsAttactments(data:IMedicalAttachments){
    
    const result:any=await query(`
        insert into medical_record_attachment
        (record_id,file_name,file_path)
        values(?,?,?)
        `,[data.record_id,data.file_name,data.file_path])

        return result[0]

}

async insertMedicalRecordAmmendment(data:IMedicalRecordAmmendment){


    const result:any =await query(`
        
        insert into medical_record_ammendments(record_id,ammended_by_doctor_id,
        field_name,old_value,new_value,reason) values (?,?,?,?,?,?)
        
        `,[data.record_id,
           data.ammended_doctor_id,
           data.field_name,
           data.old_value,
           data.new_value,
           data.reason
        ])


    return result[0]

}


async insertPrescription(data:IPrescriptions){

    const result:any =await query(`insert into prescriptions(record_id,notes) 
        values(?,?)`,[
            data.record_id,
            data.notes
        ])

        return result[0]

}


async insertPrescriptionItems(data:IPrescriptionItems)
{
    const result:any = await query(`insert into prescription_items(prescription_id,medicine_name,dosage,
        frequency,duration,instruction)values(?,?,?,?,?,?)`,
        [
        data.prescription_id,
        data.medicine_name,
        data.dosage,
        data.frequency,
        data.duration,
        data.instructions
        ])


        return result[0]
}

//  async fetchPatientMedicalRecords(doctor_id:number,patient_id:number){
    
//     const rows:any =await query(`

//         select appointment_id,
        
//         `)
//  }


}



