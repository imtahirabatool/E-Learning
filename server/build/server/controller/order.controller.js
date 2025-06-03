"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.getAllOrdersAdmin = exports.createOrder = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const order_model_1 = __importDefault(require("../models/order.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const order_service_1 = require("../services/order.service");
const redis_1 = require("../utils/redis");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// create order
exports.createOrder = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== 'succeeded') {
                    return next(new ErrorHandler_1.default("Payment not successful.", 400));
                }
            }
        }
        const user = await user_model_1.default.findById(req.user?._id);
        if (!user) {
            return next(new ErrorHandler_1.default("User not found.", 404));
        }
        const courseAlreadyPurchased = user.course.some((course) => course._id.toString() === courseId);
        if (courseAlreadyPurchased) {
            return next(new ErrorHandler_1.default("You have already purchased this course.", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found.", 404));
        }
        const orderData = {
            courseId: course._id,
            userId: user._id,
            payment_info,
        };
        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            },
        };
        try {
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/orderConfirmation.ejs"), { order: mailData });
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Order Confirmation",
                template: "orderConfirmation.ejs",
                data: mailData,
                html,
            });
        }
        catch (emailError) {
            console.error("Email error:", emailError.message);
        }
        user?.course.push({ courseId: course._id });
        await redis_1.redis.set(req.user._id, JSON.stringify(user));
        await user.save();
        course.purchased = (course.purchased || 0) + 1;
        await course.save();
        await notificationModel_1.default.create({
            user: user._id,
            title: "New Order",
            message: `You have a new order for the course: ${course.name}`,
        });
        const order = await order_model_1.default.create(orderData);
        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            order,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Get all orders -- only for admin
exports.getAllOrdersAdmin = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        await (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Send stripe Publishable request
exports.sendStripePublishableKey = (0, catchAsyncError_1.CatchAsyncError)(async (req, res) => {
    res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
// new Payment
exports.newPayment = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            metadata: {
                company: "E-Learning",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
