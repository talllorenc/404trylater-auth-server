import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "../constants/http";

interface AuthRequest extends Request {
  userId?: string;
}

export const getUserHandler = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");

    if (!user) {
      res.status(NOT_FOUND).json({ message: "User not found" });
    }

    res.status(OK).json({ user });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({
      message: "Internal server error",
    });
  }
};
