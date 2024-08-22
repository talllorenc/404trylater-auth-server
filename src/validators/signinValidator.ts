import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { BAD_REQUEST } from "../constants/http";

const signinValidator = [
  body("email").notEmpty().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
];

export default signinValidator;
