import e from "express"


export enum WorkingDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}


export interface IDoctorSchedule{
    doctor_id:number,
    working_day:WorkingDay,
    working_from:string,
    working_to:string,
    date_from:Date
    date_to:Date
    slot_duration:number
}


export interface IDoctorLeave{
    doctor_id:number, 
    from_date:Date,
    to_date:Date,
    reason:string,

}

export interface IMedicalRecords{
    doctor_id:number,
    patient_id:number,
    appointment_id:number,
    diagnosis:string,
    examination_notes:string,

}


export interface IMedicalAttachments{
    record_id:number,
    file_name:string,
    file_path:string
}


export interface IMedicalRecordAmmendment{
    record_id:number,
    ammended_doctor_id:number,
    field_name:string, 
    old_value:string,
    new_value:string,
    reason:string,
}


export interface IPrescriptions{
    record_id:number,
    notes:string
}


export interface IPrescriptionItems{
    prescription_id:number,
    medicine_name:string,
    dosage:string,
    frequency:string,
    duration:string,
    instructions:string,
}

e