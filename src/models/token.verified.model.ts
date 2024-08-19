import mongoose, {Document} from "mongoose";

interface IVerificationToken extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
}

const TokenVerifiedSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", unique: true},
  email: {type: String, required: true},
  token: {type: String, required: true},
  expiresAt: {type: Date, required: true},
})

TokenVerifiedSchema.index({"expiresAt": 1}, {expireAfterSeconds: 0});

export const TokenVerifiedModel = mongoose.model<IVerificationToken>("TokenVerified", TokenVerifiedSchema);