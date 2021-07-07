import { Request, Response } from "express";
import { Op } from "sequelize";
import {
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
  unprocessableResponse, validationResponse
} from "../helpers/apiResponse";
import { sendResetPasswordEmail } from "../../../services/email";
import jwt from "jsonwebtoken";
import * as userService from "../services/user";
import { generateJwtTokens } from "../helpers/auth";
import { sequelizeValidationErrorFormat } from "../helpers/validation";

/**
 * POST /login
 * Login
 */
const login = async (req: Request, res: Response) => {
  const email = req.body.username;
  const user = await userService.findWhere({ email });

  if (!user) {
    return unauthorizedResponse(res, "User not found");
  }

  req["user"] = user;
  const tokens: { [key: string]: any } = generateJwtTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return successResponse(res,
    Object.assign({}, tokens)
  );
};

/**
 * POST /refreshToken
 * Refresh token
 */
const refreshToken = async (req: Request, res: Response) => {
  const token = req.body.token;
  const refreshToken = req.body.refreshToken;

  try {
    const jwtPayload: any = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true
    });
    if (jwtPayload.id) {
      const user = await userService.find(jwtPayload.id);
      if (user && user.refreshToken && user.refreshToken === refreshToken) {
        const tokens: { [key: string]: any } = generateJwtTokens(user);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return successResponse(res,
          Object.assign({}, tokens)
        );
      }
    }
  } catch(e) {
    console.log(e);
  }

  return unprocessableResponse(res);
};

/**
 * POST /reset_password
 * Send email reset password
 */
const sendEmailResetPassword = async (req: Request, res: Response) => {
  const email = req.body.email;
  const user = await userService.findWhere({ email });

  if (user) {
    await userService.generateResetPasswordToken(user);
    const res = await sendResetPasswordEmail(email, user.resetPasswordToken);
  }

  return successResponse(res, {});
};

/**
 * POST /reset_password/:token
 * Reset password
 */
const resetPassword = async (req: Request, res: Response) => {
  const password = req.body.password;
  const token = req.params.token;
  const user = await userService.findWhere({
    resetPasswordToken: token,
    resetPasswordExpiredAt: {
      [Op.gte]: new Date()
    }
  });

  if (user) {
    try {
      await userService.updatePassword(user, password);
      return successResponse(res, {});
    } catch(e) {
      console.log(e.errors);
      return validationResponse(res, sequelizeValidationErrorFormat(e.errors));
    }
  }

  return notFoundResponse(res);
};

export default {
  login,
  refreshToken,
  sendEmailResetPassword,
  resetPassword
};
