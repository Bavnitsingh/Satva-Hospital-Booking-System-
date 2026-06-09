import { NotFoundException } from "../../common/helpers/http-exception.js";
import { query } from "../../database/connection.js";

export class UserRepository {
  async findUserByEmail(email: string) {
    const rows: any = await query(
      `
        select *
        from users
        where email = ?
        `,
      [email],
    );

  if (!rows.length) return null;
  return rows[0];
}

  async createUser(email: string, passwordHash: string, role: string) {
    const result: any = await query(
      `
        insert into users(
            email,
            password_hash,
            role
        )
        values(
            ?,
            ?,
            ?
        )
        `,
      [email, passwordHash, role],
    );

    const userId = result.insertId;

    const rows: any = await query(
      `
        select *
        from users
        where user_id = ?
        `,
      [userId],
    );

    return rows[0];
  }

  async findUserById(user_id:number){
    const result:any=await query('Select * from users where user_id=?',[user_id])
    
    return result[0]
  }


  async createGoogleUser(email:string,passwordHash:string,google_sub:string){
    const result:any=await query(`Insert into users(email,password_hash,role,google_sub) values(?,?,'PATIENT',?)`,[email,passwordHash,google_sub])

    const userId=result.insertId;

    const rows:any=await query(`SELECT * FROM users where user_id=?`,[userId])

    return rows[0]
  }


  async createPatient(
    userId: number,
    firstName: string,
    lastName: string,
    countryCode: string,
    mobile: string,
    dob: string,
    gender: string,
  ) {
    const result: any = await query(
      `
        insert into patients(
            user_id,
            first_name,
            last_name,
            country_code,
            mobile,
            dob,
            gender
        )
        values(
            ?, ?, ?, ?, ?, ?, ?
        )
        `,
      [userId, firstName, lastName, countryCode, mobile, dob, gender],
    );

    return result;
  }

async updateLastLogin(userId: number): Promise<void> {
    await query(
        `
        update users
        set last_login_at = UTC_TIMESTAMP(),
        updated_at = UTC_TIMESTAMP()
        where user_id = ?
        `,
        [userId]
    );
}


  async createDoctor(data: any) {
      console.log(data)
    const result = await query(
      `
        INSERT INTO doctors (
            user_id,
            hospital_id,
            first_name,
            last_name,
            gender,
            experience_years,
            consultation_fee,
            bio,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
      [
        data.user_id,
        data.hospital_id,
        data.first_name,
        data.last_name,
        data.gender,
        data.experience_years,
        data.consultation_fee,
        data.bio,
      ],
    );
    return result;
  }

  async createAdmin(data: any) {
    const result: any = await query(
      `
        INSERT INTO admins (
            user_id,
            hospital_id,
            first_name,
            last_name,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
      [data.user_id, data.hospital_id, data.first_name, data.last_name],
    );

    return result;
  }





  async updatePassword(password: string, user_id: number) {
    const sql = `
        UPDATE users
        SET password_hash = ?
        WHERE user_id = ?
    `;

    return await query(sql, [password, user_id]);
}

  async deleteOldOtp(email: string) {

    let user: any = await this.findUserByEmail(email);

    if (!user) return false;
    const sql = `
            DELETE FROM otp_verifications
            WHERE user_id = ?
        `;

    return await query(sql, [user.user_id]);
  }

  async saveOtp(otp: string, email: string) {

    let user: any = await this.findUserByEmail(email);

    if (!user) return false
    const sql = `
            INSERT INTO otp_verifications
            (
               
                user_id,
                 otp_code,
                 purpose,
                expires_at,
                created_at
            )
            VALUES
            (
                ?,
                ?,
                 'PASSWORD_RESET' ,
                NOW() + INTERVAL 2 MINUTE,
                NOW()
            )
        `;

    return await query(sql, [user.user_id, otp]);
  }

  async findOtp(email: string, otp: string) {
    const user: any = await this.findUserByEmail(email);

    if (!user) return null;

    const sql = `
      SELECT *
      FROM otp_verifications
      WHERE user_id = ?
      AND otp_code = ?
      AND expires_at > NOW()
  `;

    const rows: any = await query(sql, [
      user.user_id,
      otp
    ]);

    return rows[0] || null;
  }

  async canGetOtp(email: string) {

    let user: any = await this.findUserByEmail(email);


    console.log("hii this is user")

    const sql = `
            SELECT *
            FROM otp_verifications
            WHERE
                user_id = ?
                AND expires_at > NOW()
        `;

    const rows: any = await query(sql, [user.user_id]);

    console.log(rows)
    return rows.length === 0;
  }

  async getLatestOtp(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new NotFoundException("User not found");

    const sql = `
    SELECT otp_code
    FROM otp_verifications
    WHERE user_id = ?
      AND expires_at > NOW()
      AND purpose = 'PASSWORD_RESET'
    ORDER BY created_at DESC
    LIMIT 1
  `;

    const rows: any = await query(sql, [user.user_id]);
    if (!rows.length) return null;

    return rows[0].otp_code;
  }

  async deleteOtp(user_id: number) {
    const sql = `
      DELETE FROM otp_verifications
      WHERE user_id = ?
   `;

    return query(sql, [user_id]);
  }
}
