import { Request, Response, NextFunction } from "express";
import Customer from "../../models/mongo/customer.model";
import CustomerAuthModel from "../../models/mongo/customerAuth.model";
import {
  hashPassword,
  comparePasswords,
  generateResetToken 
} from "../../services/password.service";
import { responseHandler } from "../../services/responseHandler.service";
import { resCode } from "../../constants/resCode";
import { authToken } from "../../services/authToken.service";
import customerAuthModel from "../../models/mongo/customerAuth.model";
import jwt from "jsonwebtoken";
// import randomstring from "randomstring";


const signupCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cus_password, cus_confirm_password, ...rest } = req.body;

    // Check if passwords match
    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(
        res,
        "Passwords do not match",
        resCode.BAD_REQUEST
      );
    }

    // Check if email or phone already exists
    const existing = await Customer.findOne({
      $or: [
        { cus_email: req.body.cus_email },
        { cus_phone_number: req.body.cus_phone_number },
      ],
    });

    if (existing) {
      return responseHandler.error(
        res,
        "Email or phone already registered",
        resCode.BAD_REQUEST
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(cus_password);

    // Create customer
    const newCustomer = new Customer({
      ...rest,

      cus_password: hashedPassword,
      cus_confirm_password: hashedPassword,
    });

    await newCustomer.save();

    // ✅ Auto-login after signup
    const token = authToken.generateAuthToken({
      user_id: newCustomer._id,
      email: newCustomer.cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: newCustomer._id,
      email: newCustomer.cus_email,
    });

    // Save tokens
    await CustomerAuthModel.create({
      cus_id: newCustomer._id,
      cus_email: newCustomer.cus_email,
      cus_phone_number: newCustomer.cus_phone_number,
      cus_password: newCustomer.cus_password,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    // Return success with token and customer
    return responseHandler.success(
      res,
      "Signup successful",
      { token, refreshToken, customer: newCustomer },
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};

const loginCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cus_email, cus_password } = req.body;

    if (!cus_email || !cus_password) {
      return responseHandler.error(
        res,
        "Email and password are required",
        resCode.BAD_REQUEST
      );
    }

    const customer = await Customer.findOne({
      cus_email: cus_email.toLowerCase(),
    });

    if (!customer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    const isPasswordValid = await comparePasswords(
      cus_password,
      customer.cus_password
    );
    if (!isPasswordValid) {
      return responseHandler.error(
        res,
        "Invalid password",
        resCode.UNAUTHORIZED
      );
    }

    // ✅ Use authToken service
    const token = authToken.generateAuthToken({
      user_id: customer._id,
      email: customer.cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: customer._id,
      email: customer.cus_email,
    });

    await CustomerAuthModel.create({
      cus_id: customer._id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(
      res,
      "Login successful",
      { token, refreshToken, customer },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};



// 🔁 RESET PASSWORD


// 📩 FORGOT PASSWORD
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_email } = req.body;

    if (!cus_email) {
      return responseHandler.error(res, "Email is required", resCode.BAD_REQUEST);
    }

    const customer = await customerAuthModel.findOne({ cus_email });

    if (!customer) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }

    const resetToken = generateResetToken()

    // Save token temporarily in DB
    customer.reset_token = resetToken;
    await customer.save();

    // In real case: send resetToken via email
    // For dev/test: return the token
    return responseHandler.success(
      res,
      "Reset token generated successfully",
      { resetToken },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reset_token, new_password, confirm_password } = req.body;

    if (!reset_token || !new_password || !confirm_password) {
      return responseHandler.error(res, "All fields are required", resCode.BAD_REQUEST);
    }

    if (new_password !== confirm_password) {
      return responseHandler.error(res, "Passwords do not match", resCode.BAD_REQUEST);
    }

    // ✅ Find user by reset token
    const customer = await customerAuthModel.findOne({ reset_token });

    if (!customer) {
      return responseHandler.error(res, "Invalid or expired token", resCode.NOT_FOUND);
    }

    // ✅ Update password
    const hashedPassword = await hashPassword(new_password);
    customer.cus_password = hashedPassword;
    customer.cus_confirm_password = hashedPassword;
    customer.reset_token = ""; // clear token
    await customer.save();

    return responseHandler.success(res, "Password reset successful", {}, resCode.OK);
  } catch (error) {
    return next(error);
  }
};



export default {
  signupCustomer,
  loginCustomer,
  forgotPassword,
  resetPassword,
};
