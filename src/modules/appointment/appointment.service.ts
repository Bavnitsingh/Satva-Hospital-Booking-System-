import { AppointmentRepository } from "./appointment.repository.js";
import { generateConfirmationNo } from "./utils/confirmation.js";
import {
  IBookAppointment,
  IRescheduleAppointment,
  IAvailableSlotsResponse,
} from "./appointment.interface.js";

export class AppointmentService {
  private repo = new AppointmentRepository();

  private async resolvePatientId(user_id: number): Promise<number> {
    const id = await this.repo.getPatientIdByUserId(user_id);
    if (!id) throw new Error("Patient profile not found");
    return id;
  }

  private async resolveDoctorId(user_id: number): Promise<number> {
    const id = await this.repo.getDoctorIdByUserId(user_id);
    if (!id) throw new Error("Doctor profile not found");
    return id;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [h, m]: any = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  // Book appointment
  async bookAppointment(user_id: number, data: IBookAppointment) {
    const patient_id = await this.resolvePatientId(user_id);
    console.log(patient_id)
    const today = new Date().toISOString().split("T")[0];

    if (data.slot_date === today) {
      const [sh, sm]: any = data.start_time.split(":").map(Number);

      const slot_minutes = sh * 60 + sm;

      const now = new Date();

      const current_minutes = now.getHours() * 60 + now.getMinutes() + 120;

      if (slot_minutes <= current_minutes) {
        throw new Error("Cannot book a slot less than 2 hours from now");
      }
    }

    const max_date = new Date();
    max_date.setDate(max_date.getDate() + 60);

    if (new Date(data.slot_date) > max_date) {
      throw new Error("Cannot book more than 60 days in advance");
    }

    const taken = await this.repo.isSlotTaken(
      data.doctor_id,
      data.slot_date,
      data.start_time,
    );
    console.log("taken?",taken);
    if (taken) {
      console.log("slot taken")
      throw new Error(
        "This slot is no longer available. Please choose another.",
      );
    }

    const day_schedule: any = await this.repo.getDoctorSchedule(
      data.doctor_id,
      data.slot_date,
    );
    console.log("day_schedule",day_schedule);
    if (!day_schedule) {
      throw new Error("Doctor is not available on this date");
    }

    const end_time = this.addMinutesToTime(
      data.start_time,
      day_schedule.slot_duration,
    );
    console.log("end_time",end_time)

    const confirmation_no = generateConfirmationNo();
    console.log("conf no",confirmation_no);
    const appointment_id = await this.repo.createAppointment({
      doctor_id: data.doctor_id,
      patient_id: patient_id,
      slot_date: data.slot_date,
      start_time: data.start_time,
      end_time: end_time,
      appointment_type: data.appointment_type,
      chief_complaint: data.chief_complaint,
      confirmation_no: confirmation_no,
    });

    console.log("appointment created",appointment_id)

    const payment_id = await this.repo.createPayment({
      appointment_id: appointment_id,
      amount: data.amount,
      payment_method: data.payment_method,
      status: "SUCCESS",
      transaction_id: `TXN-${Date.now()}`,
    });
    console.log("payment_created",payment_id)
    await this.repo.updateAppointmentStatus(appointment_id, "CONFIRMED");

    await this.repo.logStatusHistory({
      appointment_id: appointment_id,
      old_status: "PAYMENT_PENDING",
      new_status: "CONFIRMED",
      changed_by_user_id: user_id,
      remarks: "Payment successful",
    });

    await this.repo.createNotification({
      user_id: user_id,
      title: "APPOINTMENT_SCHEDULED",
      message: `Your appointment has been scheduled successfully for ${data.slot_date} at ${data.start_time}.`,
    });

    return {
      appointment_id,
      payment_id,
      confirmation_no,
      slot_date: data.slot_date,
      start_time: data.start_time,
      end_time: end_time,
      status: "CONFIRMED",
    };
  }

  // Reschedule
  async rescheduleAppointment(
    user_id: number,
    appointment_id: number,
    data: IRescheduleAppointment & { doctor_id?: number },
  ) {
    const patient_id = await this.resolvePatientId(user_id);
    const appt: any = await this.repo.getAppointmentById(appointment_id);

    if (!appt) throw new Error("Appointment not found");
    if (appt.patient_id !== patient_id) throw new Error("Forbidden");

    const cancellable_statuses = ["CONFIRMED", "PAYMENT_PENDING"];
    if (!cancellable_statuses.includes(appt.appointment_status)) {
      throw new Error("Only confirmed appointments can be rescheduled");
    }

    const original_slot = new Date(`${appt.slot_date}T${appt.start_time}`);
    const now = new Date();
    const diff_ms = original_slot.getTime() - now.getTime();
    if (diff_ms < 4 * 60 * 60 * 1000) {
      throw new Error("Cannot reschedule within 4 hours of the appointment");
    }

    // Check new slot availability
    const taken = await this.repo.isSlotTaken(
      appt.doctor_id,
      data.slot_date,
      data.start_time,
    );
    if (taken) throw new Error("New slot is not available");

    const day_schedule: any = await this.repo.getDoctorSchedule(
      data.doctor_id || appt.doctor_id,
      data.slot_date,
    );

    if (!day_schedule) {
      throw new Error("Doctor is not available on this date");
    }
    const end_time = this.addMinutesToTime(
      data.start_time,
      day_schedule.slot_duration,
    );

    await this.repo.rescheduleAppointment(appointment_id, {
      slot_date: data.slot_date,
      start_time: data.start_time,
      end_time: end_time,
    });

    await this.repo.createNotification({
      user_id: user_id,
      title: "APPOINTMENT_RESCHEDULED",
      message: `Your appointment has been rescheduled successfully to ${data.slot_date} at ${data.start_time}.`,
    });

    await this.repo.logStatusHistory({
      appointment_id: appointment_id,
      old_status: appt.appointment_status,
      new_status: "RESCHEDULED",
      changed_by_user_id: user_id,
      remarks: `Rescheduled to ${data.slot_date} ${data.start_time}`,
    });

    return {
      appointment_id,
      new_slot_date: data.slot_date,
      new_start_time: data.start_time,
      end_time: end_time,
    };
  }

  // Cancel
  async cancelAppointment(
    user_id: number,
    appointment_id: number,
    reason?: string,
  ) {
    const patient_id = await this.resolvePatientId(user_id);

    const appt: any = await this.repo.getAppointmentById(appointment_id);

    if (!appt) {
      throw new Error("Appointment not found");
    }

    if (appt.patient_id !== patient_id) {
      throw new Error("Forbidden");
    }

    await this.repo.updateAppointmentStatus(appointment_id, "CANCELLED");

    const payment = await this.repo.getPaymentByAppointment(appointment_id);

    if (payment) {
      await this.repo.markPaymentRefunded(payment.payment_id);
    }

    await this.repo.logStatusHistory({
      appointment_id: appointment_id,
      old_status: appt.appointment_status,
      new_status: "CANCELLED",
      changed_by_user_id: user_id,
      remarks: reason ?? "Cancelled by patient",
    });

    await this.repo.createNotification({
      user_id: user_id,
      title: "APPOINTMENT_CANCELLED",
      message: `Your appointment has been cancelled successfully.`,
    });

    return {
      appointment_id,
      status: "CANCELLED",
      payment_status: payment ? "REFUNDED" : "NO_PAYMENT",
    };
  }

  // Get appointments list
  async getAppointments(user_id: number, status?: string) {
    const patient_id = await this.resolvePatientId(user_id);
    return this.repo.getAppointmentsByPatient(patient_id, status);
  }

  // Get available slots
  async getAvailableSlots(
    doctor_id: number,
    date: string,
  ): Promise<IAvailableSlotsResponse> {
    const now_today = new Date();

    const today = `${now_today.getFullYear()}-${String(
      now_today.getMonth() + 1,
    ).padStart(2, "0")}-${String(now_today.getDate()).padStart(2, "0")}`;

    if (date < today) {
      throw new Error("Cannot view slots for a past date");
    }

    const on_leave = await this.repo.isDoctorOnLeave(doctor_id, date);

    if (on_leave) {
      return {
        available: false,
        slots: [],
        reason: "Doctor is on leave",
      };
    }

    const day_schedule = await this.repo.getDoctorSchedule(doctor_id, date);

    if (!day_schedule) {
      return {
        available: false,
        slots: [],
        reason: "Doctor is not available on selected date",
      };
    }

    const slots: string[] = [];

    const [sh, sm] = day_schedule.working_from.split(":").map(Number);

    const [eh, em] = day_schedule.working_to.split(":").map(Number);

    let cur = sh * 60 + sm;

    const end = eh * 60 + em;

    while (cur + day_schedule.slot_duration <= end) {
      slots.push(
        `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(
          cur % 60,
        ).padStart(2, "0")}`,
      );

      cur += day_schedule.slot_duration;
    }

    const booked = await this.repo.getBookedSlots(doctor_id, date);

    const now = new Date();

    const available = slots.filter((slot) => {
      if (booked.includes(slot)) return false;

      if (date === today) {
        const [slotH, slotM]: any = slot.split(":").map(Number);

        const slot_minutes = slotH * 60 + slotM;

        const current_minutes = now.getHours() * 60 + now.getMinutes() + 120;

        return slot_minutes > current_minutes;
      }

      return true;
    });

    const day_name = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    return {
      available: true,
      doctor_id,
      date,
      day_name,
      slot_duration_minutes: day_schedule.slot_duration,
      working_from: day_schedule.working_from,
      working_to: day_schedule.working_to,
      total_slots: slots.length,
      booked_count: booked.length,
      available_slots: available,
    };
  }

  // Doctor specific methods
  async getDoctorTodaysAppointments(user_id: number) {
    const doctor_id = await this.resolveDoctorId(user_id);
    const date:any = new Date().toISOString().split("T")[0];
    const appointment_list = await this.repo.findDoctorAppointments(
      doctor_id,
      date,
    );
    return { appointment_list };
  }

  async getDoctorDashboardData(user_id: number) {
    const doctor_id = await this.resolveDoctorId(user_id);
    const dashboard_data = await this.repo.DoctorDashBoardData(doctor_id);
    return { dashboard_data };
  }
}
