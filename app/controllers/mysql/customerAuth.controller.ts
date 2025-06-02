import { Request, Response, NextFunction } from "express";
import customerModel from "../../models/mysql/customer.model";
import customerAuthModel from "../../models/mysql/customerAuth.model";
import { hashPassword, comparePasswords } from "../../services/password.service";
import { responseHandler } from "../../services/responseHandler.service";
import { resCode } from "../../constants/resCode";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

// 🔐 Signup (Register)
const signupCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_password, cus_confirm_password, ...rest } = req.body;

    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(res, "Passwords do not match", resCode.BAD_REQUEST);
    }

    const existing = await customerModel.findOne({
      where: {
        [Op.or]: [
          { cus_email: req.body.cus_email },
          { cus_phone_number: req.body.cus_phone_number },
        ],
      },
    });

    if (existing) {
      return responseHandler.error(res, "Email or phone already registered", resCode.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(cus_password);

    const customer = await customerModel.create({
      ...rest,
      cus_password: hashedPassword,
      cus_confirm_password: hashedPassword,
    });

    return responseHandler.success(res, "Signup successful", customer, resCode.CREATED);
  } catch (error) {
    return next(error);
  }
};

// 🔑 Login
const loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_email, cus_password } = req.body;

    const customer = await customerModel.findOne({ where: { cus_email } });

    if (!customer) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }

    // const isPasswordValid = await comparePasswords(cus_password, customer.cus_password);

    // if (!isPasswordValid) {
    //   return responseHandler.error(res, "Invalid password", resCode.UNAUTHORIZED);
    // }

    // Generate JWT token
    // const token = jwt.sign(
    //   { id: customer.cus_id, email: customer.cus_email },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "1d" }
    // );

    // const refreshToken = jwt.sign(
    //   { id: customer.cus_id, email: customer.cus_email },
    //   process.env.JWT_REFRESH_SECRET as string,
    //   { expiresIn: "7d" }
    // );

    // await customerAuthModel.create({
    //   cus_id: customer.cus_id,
    //   cus_auth_token: token,
    //   cus_refresh_auth_token: refreshToken,
    // });

    return responseHandler.success(
      res,
      "Login successful",
      // { token, refreshToken, customer },
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
