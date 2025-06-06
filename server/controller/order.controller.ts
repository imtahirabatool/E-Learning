import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from "../utils/redis";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


// create order
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info }: IOrder = req.body;

        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                if (paymentIntent.status !== 'succeeded') {
                    return next(new ErrorHandler("Payment not successful.", 400));
                }
            }
        }



        const user = await userModel.findById(req.user?._id);

        if (!user) {
            return next(new ErrorHandler("User not found.", 404));
        }

        const courseAlreadyPurchased = user.course.some(
            (course: any) => course._id.toString() === courseId
        );

        if (courseAlreadyPurchased) {
            return next(new ErrorHandler("You have already purchased this course.", 400));
        }

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found.", 404));
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
            const html = await ejs.renderFile(path.join(__dirname, "../mails/orderConfirmation.ejs"), { order: mailData });
            await sendMail({
                email: user.email,
                subject: "Order Confirmation",
                template: "orderConfirmation.ejs",
                data: mailData,
                html,
            });

        } catch (emailError: any) {
            console.error("Email error:", emailError.message);
        }

        user?.course.push({ courseId: course._id as string });

        await redis.set(req.user!._id, JSON.stringify(user));
        await user.save();

        course.purchased = (course.purchased || 0) + 1;
        await course.save();

        await NotificationModel.create({
            user: user._id,
            title: "New Order",
            message: `You have a new order for the course: ${course.name}`,
        });

        const order = await OrderModel.create(orderData);

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            order,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});


// Get all orders -- only for admin
export const getAllOrdersAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllOrdersService(res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// Send stripe Publishable request
export const sendStripePublishableKey = CatchAsyncError(
    async (req: Request, res: Response) => {
        res.status(200).json({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    }
);

// new Payment
export const newPayment = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);