import mongoose, { Document } from "mongoose";

export interface ICustomer extends Document {
  cus_firstname: string;
  cus_lastname: string;
  cus_email: string;
  cus_phone_number: string;
  cus_password: string;
  // reset_token?: string;
  // token?: string;
}

const customerSchema = new mongoose.Schema<ICustomer>({
  cus_firstname: { type: String, required: true },
  cus_lastname: { type: String, required: true },
  cus_email: { type: String, required: true, unique: true },
  cus_phone_number: { type: String, required: true, unique: true },
  cus_password: { type: String, required: true },
  // reset_token: { type: String, default: "" },
  // token: { type: String, default: "" }, // or rename to access_token
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
