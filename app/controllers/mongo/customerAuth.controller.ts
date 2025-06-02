import { Request, Response, NextFunction } from "express";
import Customer from "../../models/mongo/customer.model";
import CustomerAuthModel from "../../models/mongo/customerAuth.model";
import { hashPassword, comparePasswords } from "../../services/password.service";
import { responseHandler } from "../../services/responseHandler.service";
import { resCode } from "../../constants/resCode";
import jwt from "jsonwebtoken";
import { get } from "../../config/config";
const config = get(process.env.NODE_ENV || 'development');
import { authToken } from "../../services/authToken.service";

const signupCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_password, cus_confirm_password, ...rest } = req.body;

    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(res, "Passwords do not match", resCode.BAD_REQUEST);
    }

    const existing = await Customer.findOne({
      $or: [
        { cus_email: req.body.cus_email },
        { cus_phone_number: req.body.cus_phone_number },
      ],
    });

    if (existing) {
      return responseHandler.error(res, "Email or phone already registered", resCode.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(cus_password);

    const newCustomer = new Customer({
      ...rest,
      cus_password: hashedPassword,
      cus_confirm_password: hashedPassword,
    });

    await newCustomer.save();

    return responseHandler.success(res, "Signup successful", newCustomer, resCode.CREATED);
  } catch (error) {
    return next(error);
  }
};



const loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_email, cus_password } = req.body;

    if (!cus_email || !cus_password) {
      return responseHandler.error(res, "Email and password are required", resCode.BAD_REQUEST);
    }

    const customer = await Customer.findOne({ cus_email: cus_email.toLowerCase() });

    if (!customer) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }

    const isPasswordValid = await comparePasswords(cus_password, customer.cus_password);
    if (!isPasswordValid) {
      return responseHandler.error(res, "Invalid password", resCode.UNAUTHORIZED);
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





// const loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { cus_email, cus_password } = req.body;

//     // Basic input validation
//     if (!cus_email || !cus_password) {
//       return responseHandler.error(res, "Email and password are required", resCode.BAD_REQUEST);
//     }

//     // Find customer by email (normalize if needed)
//     const customer = await Customer.findOne({ cus_email: cus_email.toLowerCase() });

//     if (!customer) {
//       return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
//     }

//     // Validate password
//     const isPasswordValid = await comparePasswords(cus_password, customer.cus_password);
//     if (!isPasswordValid) {
//       return responseHandler.error(res, "Invalid password", resCode.UNAUTHORIZED);
//     }

//     // Generate auth token
//     const payload = { id: customer._id, email: customer.cus_email };
//     const token = jwt.sign(payload, config.SECURITY_TOKEN, {
//       expiresIn: config.TOKEN_EXPIRES_IN,
//     });

//     // Generate refresh token (optional but included for structure)
//     const refreshToken = jwt.sign(payload, config.SECURITY_TOKEN, {
//       expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
//     });

//     // Save tokens to CustomerAuthModel
//     await CustomerAuthModel.create({
//       cus_id: customer._id,
//       cus_auth_token: token,
//       cus_refresh_auth_token: refreshToken,
//     });

//     // Send success response
//     return responseHandler.success(
//       res,
//       "Login successful",
//       { token, refreshToken, customer },
//       resCode.OK
//     );
//   } catch (error) {
//     return next(error);
//   }
// };

// export { loginCustomer };


export default {
  signupCustomer,
  loginCustomer,
};
