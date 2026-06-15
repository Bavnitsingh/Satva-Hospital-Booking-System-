export interface IUpdatePatientProfile {
  first_name?: string;
  last_name?: string;
  address_line1?: string;
  address_line2?: string;
  blood_group?: string;
  profile_path?: string;
  is_insured?: boolean;
  policy_number?: string;
  policy_company?: string;
  policy_document_path?: string;
}

export interface IAddFamilyMember {
  relation: string;
  first_name: string;
  last_name: string;
  dob?: string;
  mobile?: string;
  email?: string;
}

export interface IUpdateFamilyMember {
  relation?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  mobile?: string;
  email?: string;
}

export interface ISearchDoctorsQuery {
  name?: string;
  specialty?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  hospital_id?: number;
  limit?: number;
  offset?: number;
}

export interface IGetDoctorSlots {
  doctor_id: number;
  date: string;
}

export interface IBookAppointment {
  doctor_id: number;
  slot_date: string;
  start_time: string;
  appointment_type: "IN_PERSON" | "TELEMEDICINE";
  chief_complaint?: string;
  amount: number;
  payment_method: string;
}

export interface IRescheduleAppointment {
  slot_date: string;
  start_time: string;
}

export interface ICancelAppointment {
  reason: string;
}

export interface INotificationsQuery {
  unread?: "true" | "false";
}