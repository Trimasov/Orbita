import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { validationResponse } from "./apiResponse";

export function sequelizeValidationErrorFormat(errors: {[key: string]: any}) {
  return Object.keys(errors).map((key) => {
    const error = errors[key];
    return {
      field: error.path,
      message: error.message
    };
  });
}

export function validatorErrorFormat(errors: Array<any>) {
  return errors.map((error) => {
    return {
      field: error.param,
      message: error.msg.toLowerCase()
    };
  });
}

export function validationHandler(req: Request, res: Response, callback: any) {
  try {
    validationResult(req).throw();
  } catch(e) {
    return validationResponse(res, validatorErrorFormat(e.errors));
  }

  return callback(req, res);
}
