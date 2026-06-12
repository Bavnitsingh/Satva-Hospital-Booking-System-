import { TelemedicineRepository } from "./telemedicine.repositories.js";
import { CreateTelemedicineSession } from "./telemedicine.interface.js";

export class TelemedicineService {
  private telemedicineRepo = new TelemedicineRepository();

  async createTelemedicineSession(
    data: CreateTelemedicineSession
  ) {
    const existingSession =
      await this.telemedicineRepo.getTelemedicineSessionByAppointmentId(
        data.appointment_id
      );

    if (existingSession) {
      throw new Error(
        "Telemedicine session already exists for this appointment"
      );
    }

    await this.telemedicineRepo.createTelemedicineSession(data);

    return {
      message: "Telemedicine session created successfully",
    };
  }

  async getTelemedicineSessionById(
    sessionId: number
  ) {
    const session =
      await this.telemedicineRepo.getTelemedicineSessionById(
        sessionId
      );

    if (!session) {
      throw new Error("Telemedicine session not found");
    }

    return session;
  }

  async getTelemedicineSessionByAppointmentId(
    appointmentId: number
  ) {
    const session =
      await this.telemedicineRepo.getTelemedicineSessionByAppointmentId(
        appointmentId
      );

    if (!session) {
      throw new Error("Telemedicine session not found");
    }

    return session;
  }

  async getTelemedicineSessionsByPatientId(
    patientId: number
  ) {
    return await this.telemedicineRepo.getTelemedicineSessionsByPatientId(
      patientId
    );
  }

  async getTelemedicineSessionsByDoctorId(
    doctorId: number
  ) {
    return await this.telemedicineRepo.getTelemedicineSessionsByDoctorId(
      doctorId
    );
  }

  async startTelemedicineSession(
    sessionId: number
  ) {
    const session =
      await this.telemedicineRepo.getTelemedicineSessionById(
        sessionId
      );

    if (!session) {
      throw new Error("Telemedicine session not found");
    }

    if (session.status !== "SCHEDULED") {
      throw new Error(
        "Only scheduled sessions can be started"
      );
    }

    await this.telemedicineRepo.startTelemedicineSession(
      sessionId
    );

    return {
      message: "Telemedicine session started successfully",
    };
  }

  async endTelemedicineSession(
    sessionId: number
  ) {
    const session =
      await this.telemedicineRepo.getTelemedicineSessionById(
        sessionId
      );

    if (!session) {
      throw new Error("Telemedicine session not found");
    }

    if (session.status !== "ACTIVE") {
      throw new Error(
        "Only active sessions can be ended"
      );
    }

    await this.telemedicineRepo.endTelemedicineSession(
      sessionId
    );

    return {
      message: "Telemedicine session ended successfully",
    };
  }

  async updateTelemedicineSessionStatus(
    sessionId: number,
    status: string
  ) {
    const session =
      await this.telemedicineRepo.getTelemedicineSessionById(
        sessionId
      );

    if (!session) {
      throw new Error("Telemedicine session not found");
    }

    await this.telemedicineRepo.updateTelemedicineSessionStatus(
      sessionId,
      status
    );

    return {
      message: "Telemedicine session status updated successfully",
    };
  }

  async updateTelemedicineMeetingLink(
    sessionId: number,
    meetingLink: string
  ) {
    const session =
      await this.telemedicineRepo.getTelemedicineSessionById(
        sessionId
      );

    if (!session) {
      throw new Error("Telemedicine session not found");
    }

    await this.telemedicineRepo.updateTelemedicineMeetingLink(
      sessionId,
      meetingLink
    );

    return {
      message: "Meeting link updated successfully",
    };
  }
}