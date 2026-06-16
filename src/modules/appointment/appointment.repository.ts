import { query } from "../../database/connection.js";
import { ICreateAppointmentData, IPaymentData, IStatusHistoryData, INotificationData } from "./appointment.interface.js";

export class AppointmentRepository {
  async getPatientIdByUserId(userId: number): Promise<number | null> {
    const result: any = await query(`SELECT patient_id FROM patients WHERE user_id = ?`, [userId]);
    return result.length ? result[0].patient_id : null;
  }

  async getDoctorIdByUserId(userId: number): Promise<number | null> {
    const result: any = await query(`SELECT doctor_id FROM doctors WHERE user_id = ?`, [userId]);
    return result.length ? result[0].doctor_id : null;
  }

  async isSlotTaken(doctorId: number, slotDate: string, startTime: string): Promise<boolean> {
    const result: any = await query(
      `SELECT appointment_id FROM appointments WHERE doctor_id = ? AND slot_date = ? AND start_time = ? AND appointment_status NOT IN ('CANCELLED', 'REJECTED')`,
      [doctorId, slotDate, startTime]
    );
    return result.length > 0;
  }

  async getDoctorSchedule(doctorId: number, date: string): Promise<any> {
    const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
    const result: any = await query(
      `SELECT * FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?`,
      [doctorId, dayOfWeek]
    );
    return result.length ? result[0] : null;
  }

  async createAppointment(data: ICreateAppointmentData): Promise<number> {
    const result: any = await query(
      `INSERT INTO appointments (doctor_id, patient_id, slot_date, start_time, end_time, appointment_type, chief_complaint, confirmation_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.doctorId, data.patientId, data.slotDate, data.startTime, data.endTime, data.appointmentType, data.chiefComplaint, data.confirmationNo]
    );
    return result.insertId;
  }

  async createPayment(data: IPaymentData): Promise<number> {
    const result: any = await query(
      `INSERT INTO payments (appointment_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?)`,
      [data.appointmentId, data.amount, data.paymentMethod, data.status, data.transactionId]
    );
    return result.insertId;
  }

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<void> {
    await query(`UPDATE appointments SET appointment_status = ? WHERE appointment_id = ?`, [status, appointmentId]);
  }

  async logStatusHistory(data: IStatusHistoryData): Promise<void> {
    await query(
      `INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by_user_id, remarks) VALUES (?, ?, ?, ?, ?)`,
      [data.appointmentId, data.oldStatus, data.newStatus, data.changedByUserId, data.remarks]
    );
  }

  async createNotification(data: INotificationData): Promise<void> {
    await query(
      `INSERT INTO notifications (user_id, notification_type, notification_message, sent_at) VALUES (?, ?, ?, UTC_TIMESTAMP())`,
      [data.userId, data.title, data.message]
    );
  }

  async getAppointmentById(appointmentId: number): Promise<any> {
    const result: any = await query(`SELECT * FROM appointments WHERE appointment_id = ?`, [appointmentId]);
    return result.length ? result[0] : null;                
  }

  async rescheduleAppointment(appointmentId: number, data: { slotDate: string; startTime: string; endTime: string }): Promise<void> {
    await query(
      `UPDATE appointments SET slot_date = ?, start_time = ?, end_time = ?, appointment_status = 'RESCHEDULED' WHERE appointment_id = ?`,
      [data.slotDate, data.startTime, data.endTime, appointmentId]
    );
  }

  async getPaymentByAppointment(appointmentId: number): Promise<any> {
    const result: any = await query(`SELECT * FROM payments WHERE appointment_id = ?`, [appointmentId]);
    return result.length ? result[0] : null;
  }

  async markPaymentRefunded(paymentId: number): Promise<void> {
    await query(`UPDATE payments SET status = 'REFUNDED' WHERE payment_id = ?`, [paymentId]);
  }

  async getAppointmentsByPatient(patientId: number, status?: string): Promise<any> {
    const params: any[] = [patientId];
    let statusFilter = "";
    if (status) {
      statusFilter = "AND a.appointment_status = ?";
      params.push(status.toUpperCase());
    }
    return query(
      `SELECT
        a.appointment_id, a.slot_date, a.start_time, a.end_time,
        a.appointment_type, a.appointment_status, a.chief_complaint, a.confirmation_no,
        d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
        d.consultation_fee, d.currency_code, d.profile_path AS doctor_photo,
        h.hospital_name,
        GROUP_CONCAT(DISTINCT s.specialty_name SEPARATOR ', ') AS specialties,
        p.status AS payment_status, p.amount AS payment_amount
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN hospitals h ON d.hospital_id = h.hospital_id
        LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
        LEFT JOIN payments p ON a.appointment_id = p.appointment_id
        WHERE a.patient_id = ? ${statusFilter}
        GROUP BY a.appointment_id
        ORDER BY a.slot_date DESC, a.start_time DESC`,
      params,
    );
  }




  async isDoctorOnLeave(doctorId: number, date: string): Promise<boolean> {
    const result: any = await query(
      `SELECT leave_id FROM doctor_leaves WHERE doctor_id = ? AND ? BETWEEN start_date AND end_date`,
      [doctorId, date]
    );
    return result.length > 0;
  }

  async getBookedSlots(doctorId: number, date: string): Promise<string[]> {
    const result: any = await query(
      `SELECT start_time FROM appointments WHERE doctor_id = ? AND slot_date = ? AND appointment_status NOT IN ('CANCELLED', 'REJECTED')`,
      [doctorId, date]
    );
    return result.map((r: any) => r.start_time);
  }

  async findDoctorAppointments(doctorId: number, date: string): Promise<any> {
    return await query(`SELECT * FROM appointments WHERE doctor_id = ? AND slot_date = ?`, [doctorId, date]);
  }

  async DoctorDashBoardData(doctorId: number): Promise<any> {
    const totalAppointments: any = await query(`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?`, [doctorId]);
    const upcomingAppointments: any = await query(`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_status IN ('CONFIRMED', 'RESCHEDULED') AND slot_date >= CURDATE()`, [doctorId]);
    const rescheduledAppointments: any = await query(`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_status = 'RESCHEDULED'`, [doctorId]);
    const cancelledAppointments: any = await query(`SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_status = 'CANCELLED'`, [doctorId]);

    return {
      'TOTAL APPOINTMENT': totalAppointments[0].count,
      'UPCOMING': upcomingAppointments[0].count,
      'RESCHEDULED': rescheduledAppointments[0].count,
      'CANCELLED': cancelledAppointments[0].count,
    };
  }
}