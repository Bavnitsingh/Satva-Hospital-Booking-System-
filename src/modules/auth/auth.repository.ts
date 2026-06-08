import { NotFoundException } from "../../common/helpers/http-exception.js";
import { query } from "../../database/connection.js";

export class UserRepository {
  async findUserByEmail(email: string) {
  if (!email) throw new Error("Email is required");

  const sql = `SELECT * FROM users WHERE email = ?`;
  const rows: any = await query(sql, [email]);

  if (!rows.length) return null;
  return rows[0];
}

  async createUser(email: string, passwordHash: string) {
    const result: any = await query(
      `
        INSERT INTO users(
            email,
            password_hash,
            role
        )
        VALUES(
            ?,
            ?,
            'PATIENT'
        )
        `,
      [email, passwordHash],
    );

    const userId = result.insertId;

    const rows: any = await query(
      `
        SELECT *
        FROM users
        WHERE user_id = ?
        `,
      [userId],
    );

    return rows[0];
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
        INSERT INTO patients(
            user_id,
            first_name,
            last_name,
            country_code,
            mobile,
            dob,
            gender
        )
        VALUES(
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
        UPDATE users
        SET last_login_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
      [userId],
    );
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
