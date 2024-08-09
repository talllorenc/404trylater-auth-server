import mongoose from "mongoose";

interface IUserSchema {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  verified: boolean;
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
)

export const UserModel = mongoose.model("User", UserSchema);
