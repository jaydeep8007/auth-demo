import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerAuth extends Document {
  cus_id: mongoose.Types.ObjectId;
  cus_email: string;
  cus_phone_number: string;
  cus_password: string; // This should be hashed and not stored in plain text
  cus_confirm_password: string; // This should also be hashed and not stored in plain text
  cus_auth_token: string;
  cus_refresh_auth_token: string;
  reset_token?: string;
  token?: string; // or rename to access_token
}

const customerAuthSchema = new Schema<ICustomerAuth>(
  {
    cus_id: {
      type: Schema.Types.ObjectId,
      ref: "customer", // refers to your customers collection
      required: true,
    },
    cus_email: { type: String, required: true, unique: true },
    cus_phone_number: { type: String, required: true, unique: true },
  cus_password: { type: String, required: true },
  cus_confirm_password: { type: String }, 
    cus_auth_token: {
      type: String,
      required: true,
    },
    cus_refresh_auth_token: {
      type: String,
      required: true,
      unique: true,
    },
    reset_token: { type: String, default: "" },
  token: { type: String, default: "" }, // or rename to access_token
  },
  {
    timestamps: true, 
  }
);

const customerAuthModel = mongoose.model<ICustomerAuth>("customer_auth", customerAuthSchema);

export default customerAuthModel;
