import passport from "passport";
import { errorResponse, unauthorizedResponse } from "./apiResponse";
import { User } from "../../../models/user";
import jwt from "jsonwebtoken";
import moment from "moment";

export function generateJwtTokens(user: User) {
  const jwtTimeoutDuration = parseInt(process.env.JWT_TIMEOUT_DURATION) || 600;
  const payload = {
    type: "user",
    id: user.id,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET,
    { expiresIn: jwtTimeoutDuration });
  const refreshToken = jwt.sign({
    email: user.email,
    datetime: moment().valueOf()
  }, process.env.JWT_SECRET);
  return {
    token,
    refreshToken
  };
}

export function authenticateJwt() {
  return function (req, res, next) {
    passport.authenticate("jwt", { session: false }, (error, user, info) => {
      if (info) {
        if (info.name === "TokenExpiredError") {
          return unauthorizedResponse(res, "JWT token expired");
        }
      }
      if (error) {
        return errorResponse(res, error);
      }
      if (!user) {
        return unauthorizedResponse(res, "Incorrect jwt token");
      }

      req.user = user;
      next();
    })(req, res, next);
  };
}

export function authenticateLocal() {
  return function (req, res, next) {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (info) {
        if (info.name === "IncorrectEmailPassword") {
          return unauthorizedResponse(res, info.message);
        }
      }
      if (error) {
        return unauthorizedResponse(res, error.message);
      }
      if (!user) {
        return unauthorizedResponse(res);
      }

      req.user = user;
      next();
    })(req, res, next);
  };
}
