import { Request, Response, NextFunction } from "express";
import customerModel from "../../models/mongo/customer.model";
import { hashPassword } from "../../services/password.service";
import { responseHandler } from "../../services/responseHandler.service";
import { resCode } from "../../constants/resCode";

const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cus_password, cus_confirm_password, ...rest } = req.body;

    if (cus_password !== cus_confirm_password) {
      return responseHandler.validationError(res, {
        password: "Password and confirm password do not match.",
      }, "Validation Error", resCode.BAD_REQUEST);
    }

    const existing = await customerModel.findOne({
      $or: [
        { cus_email: req.body.cus_email },
        { cus_phone_number: req.body.cus_phone_number },
      ],
    });

    if (existing) {
      return responseHandler.error(res, "Email or phone already exists", resCode.DUPLICATE_DATA);
    }

    const newCustomer = new customerModel({
      ...rest,
      cus_password: await hashPassword(cus_password),
      cus_confirm_password: await hashPassword(cus_confirm_password),
    });

    await newCustomer.save();

    return responseHandler.success(res, "Customer added successfully", newCustomer, resCode.CREATED);
  } catch (error) {
    return responseHandler.error(res, "Something went wrong", resCode.SERVER_ERROR, error);
  }
};

const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await customerModel.find();
    return responseHandler.success(res, "Customers fetched successfully", customers, resCode.OK);
  } catch (error) {
    return responseHandler.error(res, "Something went wrong", resCode.SERVER_ERROR, error);
  }
};

const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerModel.findById(req.params.id);
    if (!customer) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }
    return responseHandler.success(res, "Customer found", customer, resCode.OK);
  } catch (error) {
    return responseHandler.error(res, "Something went wrong", resCode.SERVER_ERROR, error);
  }
};

const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await customerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }
    return responseHandler.success(res, "Customer updated successfully", updated, resCode.OK);
  } catch (error) {
    return responseHandler.error(res, "Something went wrong", resCode.SERVER_ERROR, error);
  }
};

const deleteCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await customerModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return responseHandler.error(res, "Customer not found", resCode.NOT_FOUND);
    }
    return responseHandler.success(res, "Customer deleted successfully", deleted, resCode.OK);
  } catch (error) {
    return responseHandler.error(res, "Something went wrong", resCode.SERVER_ERROR, error);
  }
};

// ✅ Export all as an object for cleaner imports
export default {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomerById,
};
