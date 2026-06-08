import { Console } from "winston/lib/winston/transports/index.js";
import { query } from "../../database/connection.js";
import { count, profile } from "node:console";

export class PatientRepository {
  async findPatientByUserID(user_id: number) {
    const rows: any = await query(
      `
            select * from 
            patients
            where user_id=?
            `,
      [user_id],
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async updatePatient(user_id: number, data: any) {
    let {
      first_name,
      last_name,
      country_code,
      mobile,
      gender,
      dob,
      blood_group,
      is_insured,
      address_line1,
      address_line2,
    } = data;


    if(address_line2==undefined){
        address_line2=""
    }
    if(is_insured==undefined){
        is_insured=0
    }

    if(blood_group==undefined){
        blood_group=""
    }

    const result: any = await query(
      `UPDATE patients set 
        first_name=? ,
        last_name=?,
        country_code=? , 
        mobile=?,
        address_line1=? , 
        address_line2=?,
        blood_group=?,
        dob=?, 
        gender=?,
        is_insured=? 
    where user_id=?`,
      [
        first_name,
        last_name,
        country_code,
        mobile,
        address_line1,
        address_line2,
        blood_group,
        dob,
        gender,
        is_insured,
        user_id,
      ],
    );

    return result[0];
  }

  async updatePatientProfilePicture(user_id:number,profile_path:string){


    const result:any =await query(`
        update patients
        set 
        profile_path =? 
        where user_id
        
        `,[profile_path,user_id])

        return {result}
  }
}
