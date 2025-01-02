import express from "express";
import { createOrder, getAllOrdersAdmin } from "../controller/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const orderRouter = express.Router();

orderRouter.post('/create-order', isAuthenticated, createOrder);
orderRouter.get('/get-all-orders', isAuthenticated, authorizeRoles("admin"), getAllOrdersAdmin);

export default orderRouter;