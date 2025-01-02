import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/order.model";

// create new order
export const newOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction, data:any) => {
    const order = await OrderModel.create(data);

    res.status(201).json({
        success: true,
        order,
    });
});

// Get all user
export const getAllOrdersService = async (res: Response) => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });

    res.status(201).json({
        success: true,
        orders,
    })
}