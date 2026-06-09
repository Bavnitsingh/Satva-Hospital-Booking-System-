import { query } from "../../database/connection.js";

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
}