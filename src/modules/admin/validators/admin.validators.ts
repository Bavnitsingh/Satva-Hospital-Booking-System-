import z from "zod";

export const addDoctorSchema = z.object({
  hospital_id: z.number().int().positive(),

  name: z
    .string()
    .trim()
    .min(1, "Doctor name is required")
    .max(100),

  email: z
    .string()
    .trim()
    .email("Invalid email format"),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),

  specialization: z
    .string()
    .trim()
    .min(1, "Specialization is required")
    .max(100),

  experience_years: z
    .number()
    .int()
    .nonnegative("Experience must be 0 or more"),

  fee: z
    .number()
    .positive("Fee must be greater than 0"),

  gender: z
    .enum(["male", "female", "other"]),

  qualification: z
    .string()
    .trim()
    .min(1, "Qualification is required")
    .max(200)
});

export type AddDoctorSchema = z.infer<typeof addDoctorSchema>;


export const fetchDoctorsQuerySchema = z.object({
  hospital_id: z.coerce.number().int().positive(),

  page: z
    .coerce.number()
    .int()
    .positive()
    .default(1),

  limit: z
    .coerce.number()
    .int()
    .positive()
    .max(100)
    .default(10)
});

export type FetchDoctorsQuerySchema =
  z.infer<typeof fetchDoctorsQuerySchema>;

/**
 * Doctor ID Schema (for delete/update/get single doctor)
 */
export const doctorIdSchema = z.object({
  doctor_id: z.coerce.number().int().positive()
});

export type DoctorIdSchema =
  z.infer<typeof doctorIdSchema>;