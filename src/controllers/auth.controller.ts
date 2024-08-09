import {Request, Response} from "express";
import crypto from 'crypto';
import {hashValue} from "../utils/bcrypt";
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from "../constants/http";
import {ISignup} from "../types/auth";
import {UserModel} from "../models/user.model";
import {TokenVerifiedModel} from "../models/token.verified.model";
import {sendVerificationEmail} from "../utils/sendMail";

export const signupHandler = async (req: Request, res: Response) => {
  const {username, email, password}: ISignup = req.body;

  try {
    const existingUser = await UserModel.exists({email});

    if (existingUser) {
      return res.status(BAD_REQUEST).send({
        message: "An account with such an email has already been registered"
      });
    }

    const passwordHash = await hashValue(password);

    const user = await UserModel.create({
      username,
      email,
      password: passwordHash,
    });

    const token = crypto.randomBytes(32).toString('hex');
    await TokenVerifiedModel.create({
      userId: user._id,
      email,
      token,
      expiresAt: new Date(Date.now() + 3600000)
    });

    await sendVerificationEmail(email, username, token);

    res.status(OK).json({message: "Registration successful. Please check your email to verify your account."});
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: "Internal server error"
    });
  }
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  const {token, email} = req.query;

  if (!token || !email) {
    return res.status(400).send({
      message: "Missing token or email"
    });
  }

  try {
    const tokenDoc = await TokenVerifiedModel.findOne({token, email});

    if (!tokenDoc) {
      return res.status(400).send({
        message: "Invalid link"
      });
    }

    const user = await UserModel.findById(tokenDoc.userId);

    if (!user) {
      return res.status(400).send({
        message: "User not found"
      });
    }

    user.verified = true;
    await user.save();
    
    await TokenVerifiedModel.deleteOne({_id: tokenDoc._id});

    res.status(200).send({
      message: "Email verified successfully"
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error"
    });
  }
};
