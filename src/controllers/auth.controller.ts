import {Request, Response} from "express";
import {compareValue, hashValue} from "../utils/bcrypt";
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from "../constants/http";
import {ISignin, ISignup} from "../types/auth";
import {UserModel} from "../models/user.model";
import {TokenVerifiedModel} from "../models/token.verified.model";
import {sendVerificationEmail} from "../utils/sendMail";
import {generateEmailToken} from "../utils/jwt.tokens";

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

    const token = generateEmailToken();
    await TokenVerifiedModel.create({
      userId: user._id,
      email,
      token,
      expiresAt: new Date(Date.now() + 3600)
    });

    await sendVerificationEmail(email, username, token);

    res.status(OK).json({message: "Registration successful. Please check your email to verify your account."});
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: "Internal server error"
    });
  }
};

export const signinHandler = async (req: Request, res: Response) => {
  const {email, password}: ISignin = req.body;

  try {
    const user = await UserModel.findOne({email});

    if (!user) {
      return res.status(400).send({message: "Invalid email or password"});
    }

    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({message: 'Invalid email or password'});
    }

    if (!user.verified) {
      const tokenDoc = await TokenVerifiedModel.findOne({userId: user._id});

      if (tokenDoc) {
        return res.status(400).json({message: 'Please verify your email to login. A verification email has been sent.'});
      } else {
        const token = generateEmailToken();
        await TokenVerifiedModel.create({
          userId: user._id,
          email: user.email,
          token,
          expiresAt: new Date(Date.now() + 3600)
        });

        await sendVerificationEmail(user.email, user.username, token);
        return res.status(400).json({message: 'Your verification email has expired. A new verification email has been sent.'});
      }
    }

    res.status(200).json({message: 'Login successful'});
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: "Internal server error"
    });
  }
}

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
