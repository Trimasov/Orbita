import passport from "passport";
import passportJWT from "passport-jwt";
import passportLocal from "passport-local";
import bcrypt from "bcrypt";

import * as userService from "../services/user";

const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;

export default function runPassportConfig() {
  passport.use(new LocalStrategy({
      usernameField: "username",
      passwordField: "password"
    },
    async (username, password, cb) => {
      try {
        const user = await userService.findWhere({ email: username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
          return cb(null, false, {
            success: false,
            name: "IncorrectEmailPassword",
            message: "Неверный email или пароль"
          });
        }
        return cb(null, user, {
          success: true,
          message: "Logged In Successfully"
        });
      } catch (err) {
        console.log(err);
        return cb(err);
      }
    }
  ));

  passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, cb) => {
      try {
        const user = await userService.findWhere({ email: jwtPayload.email });

        if (!user) {
          return cb(null, false, {
            success: false,
            name: "IncorrectJwtToken",
            message: "Incorrect jwt token"
          });
        }

        return cb(null, user);
      } catch(err) {
        return cb(err);
      }
    }
  ));
}
