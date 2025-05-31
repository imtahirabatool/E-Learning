import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { generate12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";


// get users analytics --- only for admin
export const getUserAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generate12MonthsData(userModel);

        res.status(200).json({
            success: true,
            users,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// get courses analytics --- only for admin
export const getCoursesAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await generate12MonthsData(CourseModel);

        res.status(200).json({
            success: true,
            courses,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// get orders analytics --- only for admin
export const getOrdersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generate12MonthsData(userModel);

        res.status(200).json({
            success: true,
            orders,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});