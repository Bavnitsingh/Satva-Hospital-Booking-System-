import { Request, Response, NextFunction } from "express";
import { success, ZodSchema } from "zod";
import { generalResponse } from "../helpers/general-response.js";

export const validateRequestBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return generalResponse({
        res,
        data: result.error.flatten().fieldErrors,
        message: result.error.issues[0]?.message as string,
        statusCode: 400,
      });
    }
    req.body = result.data;
    next();
  };
};
