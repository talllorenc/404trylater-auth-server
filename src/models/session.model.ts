import mongoose, { Document } from "mongoose";

interface ISessionModel extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const SessionsSchema = new mongoose.Schema({
  userId: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  userAgent: { type: String },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now() + 30 * 24 * 60 * 60 * 1000,
  },
});

export const SessionsModel = mongoose.model<ISessionModel>(
  "Sessions",
  SessionsSchema
);
