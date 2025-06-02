import express from "express";
const router = express.Router();
// const VERIFY = require('../util/userAuth');
import customerRoutes from "./customer.route";

router.use("/api/v1/customer/", customerRoutes);
// router.use(VERIFY);

export default router;
