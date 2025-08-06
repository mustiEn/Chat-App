import express from "express";
import { logger, lastDisconnect } from "../utils/index.js";
import { validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
// import { io } from "../server.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { display_name: username, password: password },
    });

    if (!user) {
      throw new Error("User not found");
    }

    logger.log("SESSION AND ID AT LOGIN ==========", req.session);

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        msg: "User logged in successfully",
      });
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.session.passport.user;
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      const userLastDisconnect = lastDisconnect.get(userId);
      if (userLastDisconnect) lastDisconnect.delete(userId);
      res.status(200).json({
        message: "Logout",
      });
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  // try {
  //   const { token } = req.query;
  //   logger.log(token, "token");
  //   const signupRequest = await SignupRequest.findOne({
  //     where: { token: token },
  //   });
  //   if (
  //     moment()
  //       .utc()
  //       .isBefore(moment(signupRequest.dataValues.token_expiry_time))
  //   ) {
  //     const user = await User.create({
  //       username: signupRequest.dataValues.username,
  //       email: signupRequest.dataValues.email,
  //       password: signupRequest.dataValues.password,
  //     });
  //     logger.log(
  //       "SESSION AND ID AT VERIFY EMAIL ==========",
  //       req.session,
  //       req.session.id
  //     );
  //     return res.redirect("http://localhost:8080");
  //   } else {
  //     throw new Error("Token is expired");
  //   }
  // } catch (error) {
  //   next(error);
  // }
};

const getSignupRequest = async (req, res, next) => {
  // try {
  //   const token = uuidv4();
  //   const result = validationResult(req);
  //   if (!result.isEmpty()) {
  //     logger.log(result.array());
  //     throw new Error(result.array()[0].msg);
  //   }
  //   const data = matchedData(req);
  //   const { username, email, password, confirmedPassword } = data;
  //   // if (password !== confirmedPassword) {
  //   //     throw new Error('Passwords do not match')
  //   // }
  //   // if (await User.findOne({ where: { email: email } })) {
  //   //     throw new Error('Email already exists')
  //   // }
  //   await SignupRequest.create({
  //     username: username,
  //     email: email,
  //     password: password,
  //     token: token,
  //     token_expiry_time: moment()
  //       .add(1, "minute")
  //       .format("YYYY-MM-DD HH:mm:ss"),
  //   });
  //   sendMail(email, token);
  //   res.json({
  //     message: "Signup",
  //   });
  // } catch (error) {
  //   next(error);
  // }
};

export { verifyEmail, getSignupRequest, login, logout };
