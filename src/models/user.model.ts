import mongoose, {Document} from "mongoose";

interface IUserSchema extends Document {
  username: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verified: {type: Boolean, required: true, default: false},
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUserSchema>("User", UserSchema);
