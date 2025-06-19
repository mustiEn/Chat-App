import passport from "passport";
import LocalStrategy from "passport-local";
import bcrpt from "bcrypt";
import { User } from "../models/User.js";

export default passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({
        where: { username: username, password: password },
      });
      if (!user) {
        return done(null, false, { msg: "Incorrect username or password" });
      }
      // const passMathces = await bcrpt.compare(password, user.password);
      // if (!passMathces) {
      //   return done(null, false, { msg: "Incorrect username or password" });
      // }
      return done(null, user);
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    await User.findByPk(id);
    done(null, id);
  } catch (error) {
    done(error);
  }
});
