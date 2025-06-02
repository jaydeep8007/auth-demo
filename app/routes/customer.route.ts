import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

// Controllers (MongoDB)
import mongoCustomerController from "../controllers/mongo/customer.controller";
import mongoAuthController from "../controllers/mongo/customerAuth.controller";

// Controllers (MySQL)
import mysqlCustomerController from "../controllers/mysql/customer.controller";
import mysqlAuthController from "../controllers/mysql/customerAuth.controller";

// Determine DB type
const dbType = process.env.DB_TYPE?.toLowerCase();

// Select appropriate controllers
const customerController =
  dbType === "mongo" ? mongoCustomerController : mysqlCustomerController;

const authController =
  dbType === "mongo" ? mongoAuthController : mysqlAuthController;

// 📦 Customer CRUD routes
router.post("/", customerController.addCustomer);
router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomerById);

// 🔐 Auth routes
router.post("/auth/login", authController.loginCustomer);
router.post("/auth/signup", authController.signupCustomer); // Optional

export default router;
