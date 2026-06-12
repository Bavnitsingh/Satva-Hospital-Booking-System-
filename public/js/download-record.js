export async function downloadMedicalRecord(record, fileName = null) {
  const doctorName =
    `${record.doctor_first_name || ""} ${record.doctor_last_name || ""}`.trim();

  const content = `
      SATVA MEDICAL RECORD

      Record ID:
      ${record.record_id}

      Appointment ID:
      ${record.appointment_id}

      Doctor Name:
      ${doctorName || "Not Available"}

      Diagnosis:
      ${record.diagnosis || "Not Available"}

      Examination Notes:
      ${record.examination_notes || "Not Available"}

      Record Date:
      ${record.created_at.split("T")[0] || "Not Available"}

      Appointment Type:
      ${record.appointment_type || "Not Available"}

      Prescription Notes:
      ${record.prescription_notes || "No Prescription"}

      `;

  const blob = new Blob([content], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = fileName || `medical-record-${record.record_id}.txt`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
}
