import { AdminRepository } from "./admin.repository.js";


export class AdminService{
     private adminRepo = new AdminRepository();

     async fetchDoctors(hospital_id:number,page:number,limit:number){

        const doctors = await this.adminRepo.fetchDoctorsByHospitalId(hospital_id);
        return doctors;
     } 

}