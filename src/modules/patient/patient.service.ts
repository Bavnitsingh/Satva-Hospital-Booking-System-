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



}
