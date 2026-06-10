import { PatientRepository } from "./patient.repository.js";
import { generateConfirmationNo } from "./utils/confirmation.js";

const DAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export class PatientService {
  private repo = new PatientRepository();

  private async resolvePatientId(userId: number): Promise<number> {
    const id = await this.repo.getPatientIdByUserId(userId);
    if (!id) throw new Error("Patient profile not found");
    return id;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [h, m]: any = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  // profile
  async getProfile(userId: number) {
    const patient = await this.repo.getPatientByUserId(userId);
    if (!patient) throw new Error("Patient not found");
    return patient;
  }

  async updateProfile(userId: number, data: any) {
    const patientId: any = await this.resolvePatientId(userId);
    const allowed = [
      "first_name",
      "last_name",
      "address_line1",
      "address_line2",
      "blood_group",
      "profile_path",
      "is_insured",
    ];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k)),
    );
    await this.repo.updateProfile(patientId, filtered);
    return this.repo.getPatientByUserId(userId);
  }

  // Family members
  async getFamilyMembers(userId: number) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.getFamilyMembers(patientId);
  }

  async addFamilyMember(userId: number, data: any) {
    const patientId = await this.resolvePatientId(userId);

    return this.repo.addFamilyMember(patientId, data);
  }
  async updateFamilyMember(userId: number, memberId: number, data: any) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.updateFamilyMember(memberId, patientId, data);
  }

  async deleteFamilyMember(userId: number, memberId: number) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.deleteFamilyMember(memberId, patientId);
  }

  // doctor searcg
  async searchDoctors(query: any) {
    return this.repo.searchDoctors({
      name: query.name || query.first_name || query.last_name || undefined,

      specialty: query.specialty || undefined,
      gender: query.gender || undefined,

      hospitalId: query.hospitalId ? Number(query.hospitalId) : undefined,

      limit: query.limit ? Number(query.limit) : 20,

      offset: query.offset ? Number(query.offset) : 0,
    });
  }

  async getDoctorDetail(doctorId: number) {
    const doctor = await this.repo.getDoctorById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    return doctor;
  }

  // Book appointment
  async bookAppointment(
    userId: number,
    data: {
      doctorId: number;
      slotDate: string;
      startTime: string;
      appointmentType: "IN_PERSON" | "TELEMEDICINE";
      chiefComplaint?: string;
      amount: number;
    },
  ) {
    const patientId = await this.resolvePatientId(userId);

    const today = new Date().toISOString().split("T")[0];

    if (data.slotDate === today) {
      const [sh, sm]: any = data.startTime.split(":").map(Number);

      const slotMinutes = sh * 60 + sm;

      const now = new Date();

      const currentMinutes = now.getHours() * 60 + now.getMinutes() + 120;

      if (slotMinutes <= currentMinutes) {
        throw new Error("Cannot book a slot less than 2 hours from now");
      }
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    if (new Date(data.slotDate) > maxDate) {
      throw new Error("Cannot book more than 60 days in advance");
    }

    const taken = await this.repo.isSlotTaken(
      data.doctorId,
      data.slotDate,
      data.startTime,
    );

    if (taken) {
      throw new Error(
        "This slot is no longer available. Please choose another.",
      );
    }

    const schedules: any = await this.repo.getDoctorSchedule(data.doctorId);

    const daySchedule = schedules.find(
      (s: any) => s.working_day === DAY_MAP[new Date(data.slotDate).getDay()],
    );

    if (!daySchedule) {
      throw new Error("Doctor is not available on this day");
    }

    const endTime = this.addMinutesToTime(
      data.startTime,
      daySchedule.slot_duration,
    );

    const confirmationNo = generateConfirmationNo();

    const appointmentId = await this.repo.createAppointment({
      doctorId: data.doctorId,
      patientId,
      slotDate: data.slotDate,
      startTime: data.startTime,
      endTime,
      appointmentType: data.appointmentType,
      chiefComplaint: data.chiefComplaint,
      confirmationNo,
    });

    const paymentId = await this.repo.createPayment({
      appointmentId,
      amount: data.amount,
      paymentMethod: "UPI",
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
      title: "APPOINTMENT_RESCHEDULED",
      message: `Your appointment has been rescheduled successfully to ${data.slotDate} at ${data.startTime}.`,
    });

    return {
      appointmentId,
      paymentId,
      confirmationNo,
      slotDate: data.slotDate,
      startTime: data.startTime,
      endTime,
      status: "CONFIRMED",
    };
  }

  // Reschedule
  async rescheduleAppointment(
    userId: number,
    appointmentId: number,
    data: {
      slotDate: string;
      startTime: string;
    },
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

    // Check new slot availability
    const taken = await this.repo.isSlotTaken(
      appt.doctor_id,
      data.slotDate,
      data.startTime,
    );
    if (taken) throw new Error("New slot is not available");

    const schedules: any = await this.repo.getDoctorSchedule(appt.doctor_id);
    const daySchedule = schedules.find(
      (s: any) => s.working_day === DAY_MAP[new Date(data.slotDate).getDay()],
    );
    if (!daySchedule) throw new Error("Doctor is not available on that day");

    const endTime = this.addMinutesToTime(
      data.startTime,
      daySchedule.slot_duration,
    );

    await this.repo.rescheduleAppointment(appointmentId, {
      slotDate: data.slotDate,
      startTime: data.startTime,
      endTime,
    });
    await this.repo.createNotification({
      userId,
      title: "APPOINTMENT_RESCHEDULED",
      message: `Your appointment has been rescheduled successfully to ${data.slotDate} at ${data.startTime}.`,
    });

    await this.repo.logStatusHistory({
      appointmentId,
      oldStatus: appt.appointment_status,
      newStatus: "RESCHEDULED",
      changedByUserId: userId,
      remarks: `Rescheduled to ${data.slotDate} ${data.startTime}`,
    });

    return {
      appointmentId,
      newSlotDate: data.slotDate,
      newStartTime: data.startTime,
      endTime,
    };
  }

  async getAvailableSlots(doctorId: number, date: string) {
    // Validate date is not in the past
    const today: any = new Date().toISOString().split("T")[0];
    if (date < today) throw new Error("Cannot view slots for a past date");

    const onLeave = await this.repo.isDoctorOnLeave(doctorId, date);
    if (onLeave)
      return { available: false, slots: [], reason: "Doctor is on leave" };

    const dayOfWeek = DAY_MAP[new Date(date).getDay()];
    const schedules: any = await this.repo.getDoctorSchedule(doctorId);
    const daySchedule = schedules.find((s: any) => s.working_day === dayOfWeek);
    if (!daySchedule)
      return {
        available: false,
        slots: [],
        reason: `Doctor does not work on ${dayOfWeek}`,
      };

    // Generate all slots
    const slots: string[] = [];
    const [sh, sm] = daySchedule.working_from.split(":").map(Number);
    const [eh, em] = daySchedule.working_to.split(":").map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur + daySchedule.slot_duration <= end) {
      slots.push(
        `${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`,
      );
      cur += daySchedule.slot_duration;
    }

    const booked = await this.repo.getBookedSlots(doctorId, date);
    const now = new Date();
    const available = slots.filter((s) => {
      if (booked.includes(s)) return false;
      if (date === today) {
        const [slotH, slotM]: any = s.split(":").map(Number);
        const slotMs = slotH * 60 + slotM;
        const curMs = now.getHours() * 60 + now.getMinutes() + 120; 
        return slotMs > curMs;
      }
      return true;
    });

    return {
      available: true,
      doctorId,
      date,
      dayOfWeek,
      slotDurationMinutes: daySchedule.slot_duration,
      workingFrom: daySchedule.working_from,
      workingTo: daySchedule.working_to,
      totalSlots: slots.length,
      bookedCount: booked.length,
      availableSlots: available,
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

  // Appointments list
  async getAppointments(userId: number, status?: string) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.getAppointmentsByPatient(patientId, status);
  }

  // Payments

  async getPaymentHistory(userId: number) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.getPaymentHistory(patientId);
  }

  // Medical records
  async getMedicalHistory(userId: number) {
    const patientId = await this.resolvePatientId(userId);
    const raw: any[] = (await this.repo.getMedicalHistory(patientId)) as any[];

    return raw.map((r) => ({
      ...r,
      medicines: r.medicines
        ? r.medicines.split(";;").map((m: string) => {
            const [medicine_name, dosage, frequency, duration] = m.split("|");
            return { medicine_name, dosage, frequency, duration };
          })
        : [],
    }));
  }

  async getMedicalRecord(userId: number, recordId: number) {
    const patientId = await this.resolvePatientId(userId);
    const record = await this.repo.getMedicalRecordById(recordId, patientId);
    if (!record) throw new Error("Record not found");
    return record;
  }

  // Notifications
  async getNotifications(userId: number, unreadOnly: boolean) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.getNotifications(patientId, unreadOnly);
  }

  async markNotificationRead(userId: number, notificationId: number) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.markNotificationRead(notificationId, patientId);
  }

  async markAllNotificationsRead(userId: number) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.markAllNotificationsRead(patientId);
  }
}
