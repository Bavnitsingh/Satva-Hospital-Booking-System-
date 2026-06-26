import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/index.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class GeminiService {
  async summarizeMedicalRecord(record: any) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
        You are an experienced medical assistant.

        Explain this medical record in very simple language so that a non-medical patient can easily understand it.
        Also make sure that, do not use heavy formatting keep it simple & do not use pattern like **.

        Rules:

        - Use simple English.
        - Avoid medical jargon.
        - Keep sentences short.
        - Explain medicines and diagnosis in plain language.
        - Give practical health tips.
        - Mention warning signs that require doctor consultation.
        - Do not diagnose beyond the provided record.
        - Format response exactly as below.

        # Summary

        # What This Means

        # Medicines Explained

        # What You Should Do                 

        # Prevention Tips

        # When To Contact Doctor

        # Important Note

        Medical Record:

        Doctor:
        ${record.doctor_first_name} ${record.doctor_last_name}

        Appointment Type:
        ${record.appointment_type}

        Diagnosis:
        ${record.diagnosis || "Not Available"}

        Examination Notes:
        ${record.examination_notes || "Not Available"}

        Prescription Notes:
        ${record.prescription_notes || "Not Available"}

        Medicines:
        ${JSON.stringify(record.prescriptionItems, null, 2)}
        `;

    let retries = 3;
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error: any) {
        if (error?.status === 503 && retries > 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          retries--;
          continue;
        }
        throw error;
      }
    }
    // This part should ideally not be reached if retries are exhausted and an error is thrown.
    // Adding a fallback return to avoid 'not all code paths return a value' error.
    throw new Error("Failed to generate summary after multiple retries.");
  }
}
