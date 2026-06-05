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

    return rows.length > 0 ? rows[0] : null;
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
}
