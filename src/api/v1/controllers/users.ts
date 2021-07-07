import { Request, Response } from "express";
import {successResponse, errorResponse, validationResponse} from "../helpers/apiResponse";
import * as userService from "../services/user";
import { sequelizeValidationErrorFormat } from "../helpers/validation";
import * as accountService from "../services/account";
import { models } from "../../../models/models";
import { sendNewOwnerEmail } from "../../../services/email";

/**
 * GET /user
 * Get current user details
 */
const getCurrentUser = async (req: Request, res: Response) => {
  return successResponse(res, { user: req["user"] });
};

/**
 * POST /users/registration
 * Create current user details
 */

interface RequestBodyRegistration {
  name: string;
  email: string;
  password: string;
  accountName: string;
}

const registration = async (
  req: Request<any, any, RequestBodyRegistration, any>,
  res: Response) => {

  const { name, email, password, accountName } = req.body;
  const existAccount = await accountService.findWhere({name: accountName});

  if (existAccount) {
    return validationResponse(res, [{
      field: "accountName",
      message: "Аккаунт уже существует"
    }]);
  }

  const account = await models.Account.build({name: accountName});
  const user = await models.User.build({ name, email, password, role: "owner" });

  try {
    await account.save();
    user.accountId = account.id;
    await user.save();
    await sendNewOwnerEmail(user.id, user);
    req["user"] = user;
    const tokens: { [key: string]: any } = await userService.generateAndSaveJWTTokens(user);

    return successResponse(res, Object.assign({}, tokens));
  } catch(e) {
    console.log(e.errors);
    return validationResponse(res, sequelizeValidationErrorFormat(e.errors));
  }
};

export default {
  getCurrentUser,
  registration
};
