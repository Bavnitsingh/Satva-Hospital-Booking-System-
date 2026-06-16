import { query } from "../../database/connection.js";
import { ICreateAppointmentData, IPaymentData, IStatusHistoryData, INotificationData } from "./appointment.interface.js";

export class AppointmentRepository {
  async getPatientIdByUserId(userId: number): Promise<number | null> {
    const result: any = await query(`select patient_id from patients where user_id = ?`, [userId]);
    return result.length ? result[0].patient_id : null;
  }

  async getDoctorIdByUserId(userId: number): Promise<number | null> {
    const result: any = await query(`select doctor_id from doctors where user_id = ?`, [userId]);
    return result.length ? result[0].doctor_id : null;
  }

  async isSlotTaken(doctorId: number, slotDate: string, startTime: string): Promise<boolean> {
    console.log(doctorId,slotDate,startTime)
    const result: any = await query(
      `select appointment_id from appointments where doctor_id = ? and slot_date = ? and start_time = ? and appointment_status not in ('CANCELLED', 'REJECTED')`,
      [doctorId, slotDate, startTime]
    );

    return result.length > 0;
  }

  async getDoctorSchedule(doctorId: number, date: string): Promise<any> {
    // const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
    // console.log(dayOfWeek)
    const result: any = await query(
      `select * from doctor_schedules where doctor_id = ? and working_date = ?`,
      [doctorId, date]
    );
    return result.length ? result[0] : null;
  }

  async createAppointment(data: ICreateAppointmentData): Promise<number> {
    const result: any = await query(
      `insert into appointments (doctor_id, patient_id, slot_date, start_time, end_time, appointment_type, chief_complaint, confirmation_no) values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.doctorId, data.patientId, data.slotDate, data.startTime, data.endTime, data.appointmentType, data.chiefComplaint, data.confirmationNo]
    );
    return result.insertId;
  }

  async createPayment(data: IPaymentData): Promise<number> {
    const result: any = await query(
      `insert into payments (appointment_id, amount, payment_method, status, transaction_id) values (?, ?, ?, ?, ?)`,
      [data.appointmentId, data.amount, data.paymentMethod, data.status, data.transactionId]
    );
    return result.insertId;
  }

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<void> {
    await query(`update appointments set appointment_status = ? where appointment_id = ?`, [status, appointmentId]);
  }

  async logStatusHistory(data: IStatusHistoryData): Promise<void> {
    await query(
      `insert into appointment_status_history (appointment_id, old_status, new_status, changed_by_user_id, remarks) values (?, ?, ?, ?, ?)`,
      [data.appointmentId, data.oldStatus, data.newStatus, data.changedByUserId, data.remarks]
    );
  }

  async createNotification(data: INotificationData): Promise<void> {
    await query(
      `insert into notifications (user_id, notification_type, notification_message, sent_at) values (?, ?, ?, utc_timestamp())`,
      [data.userId, data.title, data.message]
    );
  }

  async getAppointmentById(appointmentId: number): Promise<any> {
    const result: any = await query(`select * from appointments where appointment_id = ?`, [appointmentId]);
    return result.length ? result[0] : null;                
  }

  async rescheduleAppointment(appointmentId: number, data: { slotDate: string; startTime: string; endTime: string }): Promise<void> {
    await query(
      `update appointments set slot_date = ?, start_time = ?, end_time = ?, appointment_status = 'RESCHEDULED' where appointment_id = ?`,
      [data.slotDate, data.startTime, data.endTime, appointmentId]
    );
  }

  async getPaymentByAppointment(appointmentId: number): Promise<any> {
    const result: any = await query(`select * from payments where appointment_id = ?`, [appointmentId]);
    return result.length ? result[0] : null;
  }

  async markPaymentRefunded(paymentId: number): Promise<void> {
    await query(`update payments set status = 'REFUNDED' where payment_id = ?`, [paymentId]);
  }

  async getAppointmentsByPatient(patientId: number, status?: string): Promise<any> {
    const params: any[] = [patientId];
    let statusFilter = "";
    if (status) {
      statusFilter = "and a.appointment_status = ?";
      params.push(status.toUpperCase());
    }
    return query(
      `select
        a.appointment_id, a.slot_date, a.start_time, a.end_time,
        a.appointment_type, a.appointment_status, a.chief_complaint, a.confirmation_no,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name,
        d.consultation_fee, d.currency_code, d.profile_path as doctor_photo,
        h.hospital_name,
        group_concat(distinct s.specialty_name separator ', ') as specialties,
        p.status as payment_status, p.amount as payment_amount
        from appointments a
        join doctors d on a.doctor_id = d.doctor_id
        join hospitals h on d.hospital_id = h.hospital_id
        left join doctor_specialties ds on d.doctor_id = ds.doctor_id
        left join specialties s on ds.specialty_id = s.specialty_id
        left join payments p on a.appointment_id = p.appointment_id
        where a.patient_id = ? ${statusFilter}
        group by a.appointment_id
        order by a.slot_date desc, a.start_time desc`,
      params,
    );
  }


  async isDoctorOnLeave(doctorId: number, date: string): Promise<boolean> {
    const result: any = await query(
      `select leave_id from doctor_leaves where doctor_id = ? and ? between from_date and to_date`,
      [doctorId, date]
    );
    return result.length > 0;
  }

  async getBookedSlots(doctorId: number, date: string): Promise<string[]> {
    const result: any = await query(
      `select start_time from appointments where doctor_id = ? and slot_date = ? and appointment_status not in ('CANCELLED', 'REJECTED')`,
      [doctorId, date]
    );
    return result.map((r: any) => r.start_time);
  }

  async findDoctorAppointments(doctorId: number, date: string): Promise<any> {
    return await query(`select * from appointments where doctor_id = ? and slot_date = ?`, [doctorId, date]);
  }

  async DoctorDashBoardData(doctorId: number): Promise<any> {
    const totalAppointments: any = await query(`select count(*) as count from appointments where doctor_id = ?`, [doctorId]);
    const upcomingAppointments: any = await query(`select count(*) as count from appointments where doctor_id = ? and appointment_status in ('CONFIRMED', 'RESCHEDULED') and slot_date >= curdate()`, [doctorId]);
    const rescheduledAppointments: any = await query(`select count(*) as count from appointments where doctor_id = ? and appointment_status = 'RESCHEDULED'`, [doctorId]);
    const cancelledAppointments: any = await query(`select count(*) as count from appointments where doctor_id = ? and appointment_status = 'CANCELLED'`, [doctorId]);

    return {
      'TOTAL APPOINTMENT': totalAppointments[0].count,
      'UPCOMING': upcomingAppointments[0].count,
      'RESCHEDULED': rescheduledAppointments[0].count,
      'CANCELLED': cancelledAppointments[0].count,
    };
  }
}