import { query } from "../../database/connection.js";

export class SuperAdminRepository {
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

  async findUserById(user_id: number) {
    const result: any = await query("Select * from users where user_id=?", [
      user_id,
    ]);

    return result[0];
  }

  async updateLastLogin(userId: number): Promise<void> {
    await query(
      `
        update users
        set last_login_at = UTC_TIMESTAMP(),
        updated_at = UTC_TIMESTAMP()
        where user_id = ?
        `,
      [userId],
    );
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
