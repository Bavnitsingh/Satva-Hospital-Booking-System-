import { PatientRepository } from "./patient.repository.js";
import {
  ISearchDoctorsQuery,
  IUpdatePatientProfile,
  IAddFamilyMember,
} from "./types/patient.js";



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

    const insurance = await this.repo.getInsuranceByPatientId(
      patient.patient_id,
    );
    const familyMembers = await this.repo.getFamilyMembers(patient.patient_id);

    return {
      ...patient,
      insurance,
      familyMembers,
    };
  }

  async updateProfile(userId: number, data: IUpdatePatientProfile) {
    const patientId: any = await this.resolvePatientId(userId);

    const allowed = [
      "first_name",
      "last_name",
      "address_line1",
      "address_line2",
      "blood_group",
      "profile_path",
      "is_insured",
      "country_code",
      "mobile",
      "dob",
      "gender",
    ];

    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k)),
    );

    const isInsured =
      filtered.is_insured === true ||
      filtered.is_insured === "true" ||
      filtered.is_insured === 1 ||
      filtered.is_insured === "1";

    filtered.is_insured = isInsured ? 1 : 0;

    await this.repo.updateProfile(patientId, filtered);

    if (isInsured) {
      const policyNumber = data.policy_number?.trim();
      const policyCompany = data.policy_company?.trim();
      const policyDocumentPath = data.policy_document_path || null;

      if (policyNumber && policyCompany) {
        await this.repo.upsertInsuranceDetails(patientId, {
          policyNumber,
          policyCompany,
          policyDocumentPath,
        });
      }
    } else {
      await this.repo.deleteInsuranceDetails(patientId);
    }

    return this.repo.getPatientByUserId(userId);
  }

  // Family members
  async getFamilyMembers(userId: number) {
    const patientId = await this.resolvePatientId(userId);
    return this.repo.getFamilyMembers(patientId);
  }

  async addFamilyMember(userId: number, data: IAddFamilyMember) {
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
  async searchDoctors(query: ISearchDoctorsQuery) {
    return this.repo.searchDoctors({
      name: query.name || undefined,
      specialty: query.specialty || undefined,
      gender: query.gender || undefined,
      hospitalId: query.hospital_id ? Number(query.hospital_id) : undefined,
      limit: query.limit ? Number(query.limit) : 20,
      offset: query.offset ? Number(query.offset) : 0,
    });
  }

  async getDoctorDetail(doctorId: number) {
    const doctor = await this.repo.getDoctorById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    return doctor;
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
    return this.repo.getNotifications(userId, unreadOnly);
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
