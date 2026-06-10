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
}