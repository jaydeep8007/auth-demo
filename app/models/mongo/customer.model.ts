import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  cus_firstname: { type: String, required: true },
  cus_lastname: { type: String, required: true },
  cus_email: { type: String, required: true, unique: true },
  cus_phone_number: { type: String, required: true, unique: true },
  cus_password: { type: String, required: true },
  cus_confirm_password: { type: String, required: true },
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
