import { query } from "../../database/connection.js";

import {
  CreateTelemedicineSession,
  TelemedicineSession,
} from "./telemedicine.interface.js";

export class TelemedicineRepository {

  async createTelemedicineSession(
    data: CreateTelemedicineSession
  ): Promise<void> {

    const sql = `
      INSERT INTO telemedicine_sessions
      (
        appointment_id,
        meeting_link
      )
      VALUES (?, ?)
    `;

    await query(sql, [
      data.appointment_id,
      data.meeting_link ?? null
    ]);
  }

  async getTelemedicineSessionById(
    sessionId: number
  ): Promise<TelemedicineSession | null> {

    const sql = `
      SELECT *
      FROM telemedicine_sessions
      WHERE session_id = ?
    `;

    const rows = await query(
      sql,
      [sessionId]
    ) as TelemedicineSession[];

    return rows.length > 0
      ? rows[0]  as TelemedicineSession
      : null;
  }

  async getTelemedicineSessionByAppointmentId(
    appointmentId: number
  ): Promise<TelemedicineSession | null> {

    const sql = `
      SELECT *
      FROM telemedicine_sessions
      WHERE appointment_id = ?
    `;

    const rows = await query(
      sql,
      [appointmentId]
    ) as TelemedicineSession[];

    return rows.length > 0
      ? rows[0] as TelemedicineSession
      : null;
  }

  async getTelemedicineSessionsByPatientId(
    patientId: number
  ): Promise<TelemedicineSession[]> {

    const sql = `
      SELECT ts.*
      FROM telemedicine_sessions ts
      INNER JOIN appointments a
        ON ts.appointment_id = a.appointment_id
      WHERE a.patient_id = ?
      ORDER BY ts.created_at DESC
    `;

    return await query(
      sql,
      [patientId]
    ) as TelemedicineSession[];
  }

  async getTelemedicineSessionsByDoctorId(
    doctorId: number
  ): Promise<TelemedicineSession[]> {

    const sql = `
      SELECT ts.*
      FROM telemedicine_sessions ts
      INNER JOIN appointments a
        ON ts.appointment_id = a.appointment_id
      WHERE a.doctor_id = ?
      ORDER BY ts.created_at DESC
    `;

    return await query(
      sql,
      [doctorId]
    ) as TelemedicineSession[];
  }

  async startTelemedicineSession(
    sessionId: number
  ): Promise<void> {

    const sql = `
      UPDATE telemedicine_sessions
      SET
        status = 'ACTIVE',
        started_at = UTC_TIMESTAMP()
      WHERE session_id = ?
    `;

    await query(sql, [sessionId]);
  }

  async endTelemedicineSession(
    sessionId: number
  ): Promise<void> {

    const sql = `
      UPDATE telemedicine_sessions
      SET
        status = 'COMPLETED',
        ended_at = UTC_TIMESTAMP()
      WHERE session_id = ?
    `;

    await query(sql, [sessionId]);
  }

  async updateTelemedicineSessionStatus(
    sessionId: number,
    status: string
  ): Promise<void> {

    const sql = `
      UPDATE telemedicine_sessions
      SET status = ?
      WHERE session_id = ?
    `;

    await query(sql, [
      status,
      sessionId
    ]);
  }

  async updateTelemedicineMeetingLink(
    sessionId: number,
    meetingLink: string
  ): Promise<void> {

    const sql = `
      UPDATE telemedicine_sessions
      SET meeting_link = ?
      WHERE session_id = ?
    `;

    await query(sql, [
      meetingLink,
      sessionId
    ]);
  }

}