import { Request, Response, NextFunction } from "express";
import customerModel from "../../models/mysql/customer.model";
import customerAuthModel from "../../models/mysql/customerAuth.model";
import { hashPassword, comparePasswords } from "../../services/password.service";
import { responseHandler } from "../../services/responseHandler.service";
import { resCode } from "../../constants/resCode";
import { authToken } from "../../services/authToken.service";
import { Op } from "sequelize";

// 📝 SIGNUP
const signupCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      cus_password,
      cus_confirm_password,
      cus_email,
      cus_phone_number,
      ...rest
    } = req.body;

    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(res, "Passwords do not match", resCode.BAD_REQUEST);
    }

    // Check if email or phone is already registered
    const existing = await customerModel.findOne({
      where: {
        [Op.or]: [{ cus_email }, { cus_phone_number }],
      },
    });

    if (existing) {
      return responseHandler.error(res, "Email or phone already registered", resCode.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(cus_password);

    // Create new customer
    const newCustomer = await customerModel.create({
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_confirm_password: hashedPassword,
      ...rest,
    });

    // Extract customer data to access cus_id
    const customerData = newCustomer.get();

    const token = authToken.generateAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    // Save tokens in customer_auth table
    await customerAuthModel.create({
      cus_id: customerData.cus_id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(
      res,
      "Signup successful",
      { token, refreshToken, customer: customerData },
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};

// 🔐 LOGIN
const loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_email, cus_password } = req.body;

    if (!cus_email || !cus_password) {
      return responseHandler.error(res, "Email and password are required", resCode.BAD_REQUEST);
    }

    const customer = await customerModel.findOne({ where: { cus_email } });

    if (!customer) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }

    const customerData = customer.get();
    const isPasswordValid = await comparePasswords(cus_password, customerData.cus_password);
    if (!isPasswordValid) {
      return responseHandler.error(res, "Invalid password", resCode.UNAUTHORIZED);
    }

    const token = authToken.generateAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    // Save tokens in customer_auth table
    await customerAuthModel.create({
      cus_id: customerData.cus_id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(
      res,
      "Login successful",
      { token, refreshToken, customer: customerData },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};

export default {
  signupCustomer,
  loginCustomer,
};
