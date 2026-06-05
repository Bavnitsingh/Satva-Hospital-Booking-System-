import { query } from "../../database/connection.js";

export class UserRepository {
  async findUserByEmail(email: string) {
    const rows: any = await query(
      `
        SELECT *
        FROM users
        WHERE email = ?
        `,
      [email],
    );

    return rows.length > 0 ? rows[0] : null;
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
}
