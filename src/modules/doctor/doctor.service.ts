
import {
  IDoctorDetails,
  IDoctorLeave,
  IDoctorNotification,
  IDoctorSchedule,
  IMedicalAttachments,
  IMedicalRecords,
  IPrescriptionItems,
  IPrescriptions,
} from "./doctor.interface.js";
import { DoctorRepo } from "./doctor.repository.js";
import {
  NotFoundException,
 
} from "../../common/helpers/http-exception.js";
import { getNextWeekStartingDay } from "./utils/doctor.utilts.js";
import { profile } from "node:console";


export class DoctorService {
  private doctorRepo = new DoctorRepo();

  async getDoctor(user_id: number) {
    const doctorDetails = await this.doctorRepo.findDoctorByUserID(user_id);
    const docQualifictionDetail =
      await this.doctorRepo.findDoctorQualificationByDoctorID(
        doctorDetails.doctor_id,
      );
    const docSpecialities =
      await this.doctorRepo.findDoctorSpecialitesByDoctorID(
        doctorDetails.doctor_id,
      );
    return { doctorDetails, docQualifictionDetail, docSpecialities };
  }

  async getSpecialties(search: string) {
    const specialities_list = await this.doctorRepo.findSpecialities(search);
    return { specialities_list };
  }

  async getDoctorId(user_id: number) {
    if (!user_id) {
      throw new NotFoundException("user not found");
    }
    const doctorDetails = await this.doctorRepo.findDoctorByUserID(user_id);
    return doctorDetails.doctor_id;
  }

  async getTodaysAppointment(user_id: number) {
    const doctor_id = await this.getDoctorId(user_id);
    const date = new Date().toISOString();
    const current_date = String(date.split("T")[0]);
    const appointment_list = await this.doctorRepo.findDoctorAppointments(
      doctor_id,
      current_date,
    );
    return { appointment_list };
  }

  async getDoctorDashboardData(user_id: number) {
    const doctor_id = await this.getDoctorId(user_id);
    const dashboard_data = await this.doctorRepo.DoctorDashBoardData(doctor_id);

    return { dashboard_data };
  }

  async getWeeklySchedule(user_id: number) {
    const doctor_id = await this.getDoctorId(user_id);
    const start_date = getNextWeekStartingDay();

    const weekScheduleList = await this.doctorRepo.findDoctorScheduleByDoctorID(
      doctor_id,
      start_date,
    );

    return { weekScheduleList };
  }

  async setWeeklySchedule(data: IDoctorSchedule) {
    if (!data) {
      throw new NotFoundException("Data is empty");
    }

    const result = await this.doctorRepo.insertORUpdateDoctorSchedule(data);
    return { result };
  }

  async setLeaves(data: IDoctorLeave) {
    const result = await this.doctorRepo.insertDoctorLeaves(data);

    return { result };
  }

  async getDoctorNotification(doctor_id: number) {
    const notifications =
      await this.doctorRepo.findDoctorNotification(doctor_id);
    return { notifications };
  }

  async insertDoctorNotification(data: IDoctorNotification) {
    const result = await this.doctorRepo.insertDoctorNotification(data);
    return { result };
  }

  async insertMedicalRecords(medical_records: IMedicalRecords) {
    const result = await this.doctorRepo.insertMedicalRecords(medical_records);
    return { result };
  }

  async insertMedicalRecordsAttachments(
    medical_record_attachment: IMedicalAttachments,
  ) {
    const result = await this.doctorRepo.insertMedicalRecordsAttactments(
      medical_record_attachment,
    );

    return { result };
  }

  async insertPrescriptions(data: IPrescriptions) {
    const result = await this.doctorRepo.insertPrescription(data);
    return { result };
  }

  async insertPrescriptionItems(data: IPrescriptionItems) {
    const result = await this.doctorRepo.insertPrescriptionItems(data);
    return { result };
  }

  async getPatientList(user_id: number) {
    const doctor_id = await this.getDoctorId(user_id);
    const result = await this.doctorRepo.fetchPatientList(doctor_id);
    return { result };
  }

  async getPatientAllMedicalRecords(user_id: number, patient_id: number) {
    const doctor_id = await this.getDoctorId(user_id);

    const result = await this.doctorRepo.fetchPatientAllMedicalRecords(
      patient_id,
      doctor_id,
    );
    return { result };
  }

  async getPatientAllMedicalAttachments(record_id: number) {
    const result =
      await this.doctorRepo.fetchPatientMedicalAttachments(record_id);

    return { result };
  }

  async getPatientMedicalRecordAllPrescription(record_id: number) {
    const prescription =
      await this.doctorRepo.fetchPatientPrescriptions(record_id);
    const prescription_items =
      await this.doctorRepo.fetchPatientPrescriptionsItems(
        prescription.prescription_id,
      );

    return { prescription, prescription_items };
  }

  async postProfileUpdateData(data: any, file: any) {
    const doctor_details=data.doctor_details

    const profile_path=file?.destination || '/uploads/doctor_profile/default.png'
    
    const docDetail: IDoctorDetails = {
      first_name: doctor_details.first_name,
      last_name: doctor_details.last_name,
      experience_years: Number(doctor_details.experience_years),
      consultation_fee: Number(doctor_details.consultation_fee),
      bio: doctor_details.bio,
        profile_path:profile_path,
      doctor_id:doctor_details.doctor_id
    };


    const docQualifictionDetail=data.qualifications.map((q:any,i:number)=>[doctor_details.doctor_id,q.degree,q.graduation_year,q.college_name])
    const docSpecialities=data.specialties.map((q:any,i:number)=>[doctor_details.doctor_id,q.specialty_id])

    console.log(docQualifictionDetail,docSpecialities)

    const doc_detail_result=await this.doctorRepo.updateDoctorDetail(docDetail)
    const doc_qualification_result=await this.doctorRepo.updateDoctorQualifications(docQualifictionDetail)
    const doctor_specialties_result=await this.doctorRepo.updateDoctorSpecialities(docSpecialities)


    return {doc_detail_result,doc_qualification_result,doctor_specialties_result}


  }
}
