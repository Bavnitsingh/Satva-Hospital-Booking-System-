export interface TelemedicineSession {
  session_id: number;
  appointment_id: number;
  meeting_link: string | null;
  status:
    | "SCHEDULED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";
  started_at: Date | null;
  ended_at: Date | null;
  created_at: Date;
  updated_at: Date;
}


export interface CreateTelemedicineSession {
  appointment_id: number;
  meeting_link?: string;
}


export interface UpdateTelemedicineSessionStatus {
  status:
    | "SCHEDULED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";
}

export interface StartTelemedicineSession {
  started_at: Date;
}

export interface EndTelemedicineSession {
  ended_at: Date;
}


export interface UpdateTelemedicineMeetingLink {
  meeting_link: string;
}