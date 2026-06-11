import { AuthService } from "../auth/auth.service.js";
import { AdminRepository } from "./admin.repository.js";
import { AuditPayload } from "./interfaces/audit.interface.js";


export class AdminService{
     private adminRepo = new AdminRepository();
      private authservice = new AuthService()
     async fetchDoctors(hospital_id:number){

        const doctors = await this.adminRepo.fetchDoctorsByHospitalId(hospital_id);
        return doctors;
     } 

     async addDoctor(data:any){
     const result = await this.authservice.registerDoctor(data);
     
     }
     async getHospitalId (user_id : number){
      const {hospital_id} = await this.adminRepo.fetchHospitalIdFromAdminId(user_id);
      return hospital_id;
     }
     async fetchPatients(hospital_id: number) {
    return await this.adminRepo.fetchPatientsByHospital(hospital_id);
  }
  async fetchDoctorFromId(doctor_id:number){
  const doctor =  await this.adminRepo.getDoctorById(doctor_id);
  return doctor;
  }

  async editDoctor(doctor_id:number,data:any){
   const doctor = await this.adminRepo.editDoctor(doctor_id,data);
   return doctor;
  }

  async addAuditLogs(payload:AuditPayload){
   const logs = await this.adminRepo.addAuditLogs(payload);
   return logs;
  }

  async fetchAppointmentsByHospitalId(hospital_id:number){
    const appointments = await this.adminRepo.fetchAppointments(hospital_id);
    return appointments;
  }
  async fetchAuditLogs (hospital_id:number){
    const logs = await this.adminRepo.fetchAuditLogs(hospital_id);
    return logs;
  }
}