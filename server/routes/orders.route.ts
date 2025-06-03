import express from "express";
import { createOrder, getAllOrdersAdmin, newPayment, sendStripePublishableKey } from "../controller/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controller/user.controller";

const orderRouter = express.Router();

orderRouter.post('/create-order', isAuthenticated, createOrder);
orderRouter.get('/get-all-orders', updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllOrdersAdmin);
orderRouter.get("/payment/stripe-publishable-key", sendStripePublishableKey);
orderRouter.post("/payment", isAuthenticated, newPayment);

export default orderRouter;