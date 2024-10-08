import {Request, Response} from "express";
import {compareValue, hashValue} from "../utils/bcrypt";
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED,} from "../constants/http";
import {JWT_REFRESH_SECRET, JWT_SECRET} from "../constants/env";
import {ISignin, ISignup} from "../types/auth";
import {UserModel} from "../models/user.model";
import {TokenVerifiedModel} from "../models/token.verified.model";
import {sendVerificationEmail} from "../utils/sendMail";
import {generateEmailToken} from "../utils/jwt.tokens";
import jwt from "jsonwebtoken";
import {clearAuthCookies, getAccessTokenCookieOptions, setAuthCookies,} from "../utils/cookies";

interface DecodedToken {
  userId: string;
  exp: number;
}

export const signupHandler = async (req: Request, res: Response) => {
  const {username, email, password}: ISignup = req.body;

  try {
    const existingUser = await UserModel.exists({email});

    if (existingUser) {
      return res.status(BAD_REQUEST).send({
        message: "An account with such an email has already been registered",
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
      expiresAt: new Date(Date.now() + 3600),
    });

    await sendVerificationEmail(email, username, token);

    res
      .status(OK)
      .json({
        message:
          "Registration successful. Please check your email to verify your account.",
      });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: "Internal server error",
    });
  }
};

export const signinHandler = async (req: Request, res: Response) => {
  const {email, password, userAgent}: ISignin = req.body;

  try {
    const user = await UserModel.findOne({email});

    if (!user) {
      return res
        .status(BAD_REQUEST)
        .send({message: "Invalid email or password"});
    }

    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(BAD_REQUEST)
        .json({message: "Invalid email or password"});
    }

    if (!user.verified) {
      const tokenDoc = await TokenVerifiedModel.findOne({userId: user._id});

      if (tokenDoc) {
        return res
          .status(BAD_REQUEST)
          .json({
            message:
              "Please verify your email to login. A verification email has been sent.",
          });
      } else {
        const token = generateEmailToken();
        await TokenVerifiedModel.create({
          userId: user._id,
          email: user.email,
          token,
          expiresAt: new Date(Date.now() + 3600),
        });

        await sendVerificationEmail(user.email, user.username, token);
        return res
          .status(BAD_REQUEST)
          .json({
            message:
              "Your verification email has expired. A new verification email has been sent.",
          });
      }
    }

    const accessToken = jwt.sign({userId: user._id}, JWT_SECRET, {
      expiresIn: "1m",
    });

    const refreshToken = jwt.sign({userId: user._id}, JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    setAuthCookies({res, accessToken, refreshToken});

    res.status(OK).json({message: "Login successful"});
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: "Internal server error",
    });
  }
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  const {email, token} = req.query;

  if (typeof email !== "string" || typeof token !== "string") {
    return res.status(BAD_REQUEST).json({message: "Invalid parameters"});
  }

  try {
    const verificationToken = await TokenVerifiedModel.findOne({
      email,
      token,
    });

    if (!verificationToken) {
      return res
        .status(BAD_REQUEST)
        .json({message: "Invalid or expired token"});
    }

    const user = await UserModel.findById(verificationToken.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({message: "User not found"});
    }

    user.verified = true;
    await user.save();

    await TokenVerifiedModel.deleteOne({_id: verificationToken._id});

    return res.status(OK).json({message: "Email verified successfully"});
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({message: "Server error"});
  }
};

export const logout = async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    return res.status(UNAUTHORIZED).json({message: "Not authorized"});
  }

  jwt.verify(accessToken, JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(UNAUTHORIZED).json({message: "Invalid token"});
    }

    clearAuthCookies(res).status(OK).json({message: "Logout successful"});
  });
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!refreshToken) {
    return res.status(UNAUTHORIZED).json({message: "Missing refresh token"});
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET
    ) as DecodedToken;

    if (!decoded) {
      return res
        .status(UNAUTHORIZED)
        .json({message: "Invalid refresh token"});
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(UNAUTHORIZED).json({message: "User not found"});
    }

    const accessToken = jwt.sign({userId: user._id}, JWT_SECRET, {
      expiresIn: "1m",
    });

    return res
      .status(OK)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .json({message: "Access token refreshed"});

  } catch (error) {
    return res.status(UNAUTHORIZED).json({message: "Token refresh failed"});
  }
};

