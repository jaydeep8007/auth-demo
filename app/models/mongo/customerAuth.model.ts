import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerAuth extends Document {
  cus_id: mongoose.Types.ObjectId;
  cus_auth_token: string;
  cus_refresh_auth_token: string;
}

const customerAuthSchema = new Schema<ICustomerAuth>(
  {
    cus_id: {
      type: Schema.Types.ObjectId,
      ref: "customer", // refers to your customers collection
      required: true,
    },
    cus_auth_token: {
      type: String,
      required: true,
    },
    cus_refresh_auth_token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true, // optional: adds createdAt and updatedAt fields
  }
);

const customerAuthModel = mongoose.model<ICustomerAuth>("customer_auth", customerAuthSchema);

export default customerAuthModel;
