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

export interface IGetDoctorSlots {
  doctor_id: number;
  date: string;
}

export interface IAppointment {
  appointment_id: number;
  doctor_id: number;
  patient_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  appointment_type: "IN_PERSON" | "TELEMEDICINE";
  appointment_status: string;
  chief_complaint?: string;
  confirmation_no: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateAppointmentData {
  doctorId: number;
  patientId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  appointmentType: "IN_PERSON" | "TELEMEDICINE";
  chiefComplaint?: string | undefined;
  confirmationNo: string;
}

export interface IPaymentData {
  appointmentId: number;
  amount: number;
  paymentMethod: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
  transactionId: string;
}

export interface IStatusHistoryData {
  appointmentId: number;
  oldStatus: string | null;
  newStatus: string;
  changedByUserId: number;
  remarks?: string;
}

export interface INotificationData {
  userId: number;
  title: string;
  message: string;
}

export interface IAvailableSlotsResponse {
  available: boolean;
  doctorId?: number;
  date?: string;
  dayName?: string;
  slotDurationMinutes?: number;
  workingFrom?: string;
  workingTo?: string;
  totalSlots?: number;
  bookedCount?: number;
  availableSlots?: string[];
  slots?: string[];
  reason?: string;
}
