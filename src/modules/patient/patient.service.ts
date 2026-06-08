import { UserRepository } from "../auth/auth.repository.js";
import { sign,verifyToken } from "../auth/utils/jwt.js";
import { userProfileSchema } from "../auth/validators/user.validator.js";
import { PatientRepository } from "./patient.repository.js";


export class PatientService{


    private patientRepo=new PatientRepository();

    async showProfile(user_id:number){

        const patient=await this.patientRepo.findPatientByUserID(user_id)
        if(!patient){
            throw new Error("Please Complete Profile")
        }

        return {patient}
    }

    async updateProfile(data:any,user_id:number){

        console.log(data)
        console.log(user_id)
        const  isValidate= userProfileSchema.safeParse(data)
        

        if(!isValidate.success){
            throw new Error(isValidate.error.message)
        }

        const isPatientExist=await this.patientRepo.findPatientByUserID(user_id)
        if(!isPatientExist){

            //logic 
            console.log('patient Does not exits for update')
        }

        else{

            const result=await this.patientRepo.updatePatient(user_id,data)
            return {result}

        }

        

    }


    async updatePatientProfile(user_id:number,file_path:string){
        
        const result= await this.patientRepo.updatePatientProfilePicture(user_id,file_path)
        return {result}

    }


}


