import { JwtPayload } from "../auth/utils/jwt.js";
import { DoctorRepo } from "./doctor.repository.js";


export class DoctorService{

    private doctorRepo=new DoctorRepo()


    async getDoctor(user_id:number){

        const doctorDetails=await this.doctorRepo.findDoctorByUserID(user_id)

        const docQualifictionDetail= await this.doctorRepo.findDoctorQualificationByDoctorID(doctorDetails.doctor_id)
        return {doctorDetails,docQualifictionDetail}
        
    }
    
    async getDoctorsAppointment(){



    }

}