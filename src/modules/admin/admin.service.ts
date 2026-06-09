import { AuthService } from "../auth/auth.service.js";
import { AdminRepository } from "./admin.repository.js";


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

}