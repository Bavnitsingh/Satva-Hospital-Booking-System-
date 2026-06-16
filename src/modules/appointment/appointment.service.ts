import { AppointmentRepository } from "./appointment.repository.js";
import { generateConfirmationNo } from "./utils/confirmation.js";
import {
  IBookAppointment,
  IRescheduleAppointment,
  IAvailableSlotsResponse,
} from "./appointment.interface.js";

export class AppointmentService {
  private repo = new AppointmentRepository();

  private async resolvePatientId(userId: number): Promise<number> {
    const id = await this.repo.getPatientIdByUserId(userId);
    if (!id) throw new Error("Patient profile not found");
    return id;
  }

  private async resolveDoctorId(userId: number): Promise<number> {
    const id = await this.repo.getDoctorIdByUserId(userId);
    if (!id) throw new Error("Doctor profile not found");
    return id;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [h, m]: any = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  // Book appointment
  async bookAppointment(userId: number, data: IBookAppointment) {
    const patientId = await this.resolvePatientId(userId);
    console.log(data,patientId)
    const today = new Date().toISOString().split("T")[0];

    if (data.slot_date === today) {
      const [sh, sm]: any = data.start_time.split(":").map(Number);

      const slotMinutes = sh * 60 + sm;

      const now = new Date();

      const currentMinutes = now.getHours() * 60 + now.getMinutes() + 120;

      if (slotMinutes <= currentMinutes) {
        throw new Error("Cannot book a slot less than 2 hours from now");
      }
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    if (new Date(data.slot_date) > maxDate) {
      throw new Error("Cannot book more than 60 days in advance");
    }
    
    const taken = await this.repo.isSlotTaken(
      data.doctor_id,
      data.slot_date,
      data.start_time,
    );

    if (taken) {
      throw new Error(
        "This slot is no longer available. Please choose another.",
      );
    }

    const daySchedule: any = await this.repo.getDoctorSchedule(
      data.doctor_id,
      data.slot_date,
    );

    if (!daySchedule) {
      throw new Error("Doctor is not available on this date");
    }

    const endTime = this.addMinutesToTime(
      data.start_time,
      daySchedule.slot_duration,
    );

    const confirmationNo = generateConfirmationNo();

    const appointmentId = await this.repo.createAppointment({
      doctorId: data.doctor_id,
      patientId,
      slotDate: data.slot_date,
      startTime: data.start_time,
      endTime,
      appointmentType: data.appointment_type,
      chiefComplaint: data.chief_complaint,
      confirmationNo,
    });

    const paymentId = await this.repo.createPayment({
      appointmentId,
      amount: data.amount,
      paymentMethod: data.payment_method,
      status: "SUCCESS",
      transactionId: `TXN-${Date.now()}`,
    });

    await this.repo.updateAppointmentStatus(appointmentId, "CONFIRMED");

    await this.repo.logStatusHistory({
      appointmentId,
      oldStatus: "PAYMENT_PENDING",
      newStatus: "CONFIRMED",
      changedByUserId: userId,
      remarks: "Payment successful",
    });

    await this.repo.createNotification({
      userId,
      title: "APPOINTMENT_SCHEDULED",
      message: `Your appointment has been scheduled successfully for ${data.slot_date} at ${data.start_time}.`,
    });

    return {
      appointmentId,
      paymentId,
      confirmationNo,
      slotDate: data.slot_date,
      startTime: data.start_time,
      endTime,
      status: "CONFIRMED",
    };
  }

  // Reschedule
  async rescheduleAppointment(
    userId: number,
    appointmentId: number,
    data: IRescheduleAppointment & { doctor_id?: number },
  ) {
    const patientId = await this.resolvePatientId(userId);
    const appt: any = await this.repo.getAppointmentById(appointmentId);

    if (!appt) throw new Error("Appointment not found");
    if (appt.patient_id !== patientId) throw new Error("Forbidden");

    const cancellableStatuses = ["CONFIRMED", "PAYMENT_PENDING"];
    if (!cancellableStatuses.includes(appt.appointment_status)) {
      throw new Error("Only confirmed appointments can be rescheduled");
    }

    const originalSlot = new Date(`${appt.slot_date}T${appt.start_time}`);
    const now = new Date();
    const diffMs = originalSlot.getTime() - now.getTime();
    if (diffMs < 4 * 60 * 60 * 1000) {
      throw new Error("Cannot reschedule within 4 hours of the appointment");
    }
    console.log(data)
    // Check new slot availability
    const taken = await this.repo.isSlotTaken(
      appt.doctor_id,
      data.slot_date,
      data.start_time,
    );
    if (taken) throw new Error("New slot is not available");

    const daySchedule: any = await this.repo.getDoctorSchedule(
      data.doctor_id || appt.doctor_id,
      data.slot_date,
    );

    if (!daySchedule) {
      throw new Error("Doctor is not available on this date");
    }
    const endTime = this.addMinutesToTime(
      data.start_time,
      daySchedule.slot_duration,
    );

    await this.repo.rescheduleAppointment(appointmentId, {
      slotDate: data.slot_date,
      startTime: data.start_time,
      endTime,
    });

    await this.repo.createNotification({
      userId,
      title: "APPOINTMENT_RESCHEDULED",
      message: `Your appointment has been rescheduled successfully to ${data.slot_date} at ${data.start_time}.`,
    });

    await this.repo.logStatusHistory({
      appointmentId,
      oldStatus: appt.appointment_status,
      newStatus: "RESCHEDULED",
      changedByUserId: userId,
      remarks: `Rescheduled to ${data.slot_date} ${data.start_time}`,
    });

    return {
      appointmentId,
      newSlotDate: data.slot_date,
      newStartTime: data.start_time,
      endTime,
    };
  }

  // Cancel
  async cancelAppointment(
    userId: number,
    appointmentId: number,
    reason?: string,
  ) {
    const patientId = await this.resolvePatientId(userId);

    const appt: any = await this.repo.getAppointmentById(appointmentId);

    if (!appt) {
      throw new Error("Appointment not found");
    }

    if (appt.patient_id !== patientId) {
      throw new Error("Forbidden");
    }

    await this.repo.updateAppointmentStatus(appointmentId, "CANCELLED");

    const payment = await this.repo.getPaymentByAppointment(appointmentId);

    if (payment) {
      await this.repo.markPaymentRefunded(payment.payment_id);
    }

    await this.repo.logStatusHistory({
      appointmentId,
      oldStatus: appt.appointment_status,
      newStatus: "CANCELLED",
      changedByUserId: userId,
      remarks: reason ?? "Cancelled by patient",
    });

    await this.repo.createNotification({
      userId,
      title: "APPOINTMENT_CANCELLED",
      message: `Your appointment has been cancelled successfully.`,
    });

    return {
      appointmentId,
      status: "CANCELLED",
      paymentStatus: payment ? "REFUNDED" : "NO_PAYMENT",
    };
  }

  // Get appointments list
  async getAppointments(userId: number, status?: string) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.getAppointmentsByPatient(patientId, status);
  }

  // Get available slots
  async getAvailableSlots(
    doctorId: number,
    date: string,
  ): Promise<IAvailableSlotsResponse> {
    const now_today = new Date();

    const today = `${now_today.getFullYear()}-${String(
      now_today.getMonth() + 1,
    ).padStart(2, "0")}-${String(now_today.getDate()).padStart(2, "0")}`;

    if (date < today) {
      throw new Error("Cannot view slots for a past date");
    }

    const onLeave = await this.repo.isDoctorOnLeave(doctorId, date);

    if (onLeave) {
      return {
        available: false,
        slots: [],
        reason: "Doctor is on leave",
      };
    }

    const daySchedule = await this.repo.getDoctorSchedule(doctorId, date);

    if (!daySchedule) {
      return {
        available: false,
        slots: [],
        reason: "Doctor is not available on selected date",
      };
    }

    const slots: string[] = [];

    const [sh, sm] = daySchedule.working_from.split(":").map(Number);

    const [eh, em] = daySchedule.working_to.split(":").map(Number);

    let cur = sh * 60 + sm;

    const end = eh * 60 + em;

    while (cur + daySchedule.slot_duration <= end) {
      slots.push(
        `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(
          cur % 60,
        ).padStart(2, "0")}`,
      );

      cur += daySchedule.slot_duration;
    }

    const booked = await this.repo.getBookedSlots(doctorId, date);

    const now = new Date();

    const available = slots.filter((slot) => {
      if (booked.includes(slot)) return false;

      if (date === today) {
        const [slotH, slotM]: any = slot.split(":").map(Number);

        const slotMinutes = slotH * 60 + slotM;

        const currentMinutes = now.getHours() * 60 + now.getMinutes() + 120;

        return slotMinutes > currentMinutes;
      }

      return true;
    });

    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    return {
      available: true,
      doctorId,
      date,
      dayName,
      slotDurationMinutes: daySchedule.slot_duration,
      workingFrom: daySchedule.working_from,
      workingTo: daySchedule.working_to,
      totalSlots: slots.length,
      bookedCount: booked.length,
      availableSlots: available,
    };
  }

  // Doctor specific methods
  async getDoctorTodaysAppointments(userId: number) {
    const doctorId = await this.resolveDoctorId(userId);
    const date:any = new Date().toISOString().split("T")[0];
    const appointmentList = await this.repo.findDoctorAppointments(
      doctorId,
      date,
    );
    return { appointmentList };
  }

  async getDoctorDashboardData(userId: number) {
    const doctorId = await this.resolveDoctorId(userId);
    const dashboardData = await this.repo.DoctorDashBoardData(doctorId);
    return { dashboardData };
  }
}
