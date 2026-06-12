import { TelemedicineRepository } from "./telemedicine.repositories.js";
import { CreateTelemedicineSession, ZoomResponse } from "./telemedicine.interface.js";
import { createZoomMeeting } from "./utils/zoom.service.js";
import strict from "node:assert/strict";

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


    let meeting : ZoomResponse = await createZoomMeeting();

    data.meeting_link = meeting.join_url as string;

    const result = await this.telemedicineRepo.createTelemedicineSession(data);

    return {
      data : result,
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

    if (session.status !== "STARTED") {
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
  sessionId: number
) {


  const meeting =
    await createZoomMeeting();

  await this.telemedicineRepo
    .updateTelemedicineMeetingLink(
      sessionId,
      meeting.join_url as string
    );

  return {
    sessionId,
    meetingLink: meeting.join_url,
    hostLink: meeting.start_url,
    zoomMeetingId: meeting.id
  };
}
}