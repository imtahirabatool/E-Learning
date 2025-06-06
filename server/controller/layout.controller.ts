import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";
import { title } from "process";

// create layout
export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExists = await LayoutModel.findOne({ type });
        if (isTypeExists) {
            return next(new ErrorHandler(`${type} already exists.`, 400))
        }
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                }
            }
            await LayoutModel.create(banner);
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.create({ type: "FAQ", faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )
            await LayoutModel.create({ type: "Categories", categories: categoriesItems });
        }

        res.status(201).json({
            success: true,
            message: "Layout created successfully."
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// Edit layout
export const editLayout = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type } = req.body;

            if (type === "Banner") {
                const bannerData: any = await LayoutModel.findOne({ type: "Banner" });

                const { image, title, subTitle } = req.body;

                const data = image.startsWith("https")
                    ? bannerData
                    : await cloudinary.v2.uploader.upload(image, {
                        folder: "layout",
                    });

                const banner = {
                    type: "Banner",
                    image: {
                        public_id: image.startsWith("https")
                            ? bannerData.banner.image.public_id
                            : data.public_id,
                        url: image.startsWith("https")
                            ? bannerData.banner.image.url
                            : data.secure_url,
                    },
                    title,
                    subTitle,
                };

                if (bannerData) {
                    await LayoutModel.findByIdAndUpdate(bannerData._id, { banner });
                } else {
                    await LayoutModel.create(banner);
                }
            }

            if (type === "FAQ") {
                const { faq } = req.body;
                const FaqData = await LayoutModel.findOne({ type: "FAQ" });
                const faqItems = await Promise.all(
                    faq.map(async (item: any) => {
                        return {
                            question: item.question,
                            answer: item.answer,
                        };
                    })
                );

                await LayoutModel.findByIdAndUpdate(FaqData?._id, {
                    type: "FAQ",
                    faq: faqItems,
                });
            }

            if (type === "Categories") {
                const { categories } = req.body;
                const categoriesData = await LayoutModel.findOne({
                    type: "Categories",
                });
                const categoriesItems = await Promise.all(
                    categories.map(async (item: any) => {
                        return {
                            title: item.title,
                        };
                    })
                );

                await LayoutModel.findByIdAndUpdate(categoriesData?._id, {
                    type: "Categories",
                    categories: categoriesItems,
                });
            }

            res.status(200).json({
                success: true,
                message: "Layout updated successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// Get layout by type
export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        const layout = await LayoutModel.findOne({ type });

        res.status(200).json({
            success: true,
            layout
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})