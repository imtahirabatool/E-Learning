import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import axios from "axios";
import ejs from "ejs";
import path from "path";

// Upload Course
export const uploadCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const thumbnail = data.thumbnail;
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };

            createCourse(data, res, next);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// Edit Course
export const editCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const thumbnail = data.thumbnail;
            const courseId = req.params.id;
            const courseData = (await CourseModel.findById(courseId)) as any;
            if (thumbnail && !thumbnail.startsWith("https")) {
                await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

                const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });

                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }

            if (thumbnail.startsWith("https")) {
                data.thumbnail = {
                    public_id: courseData?.thumbnail.public_id,
                    url: courseData?.thumbnail.url,
                };
            }

            const course = await CourseModel.findByIdAndUpdate(
                courseId,
                { $set: data },
                { new: true }
            );

            res.status(201).json({
                success: true,
                course: course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const isCacheExits = await redis.get(courseId);

        if (isCacheExits) {
            const course = JSON.parse(isCacheExits);
            res.status(200).json({
                success: true,
                course,
            })
        } else {
            const course = await CourseModel.findById(req.params.id).select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            );

            await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days
            res.status(200).json({
                success: true,
                course,
            })
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// get all course --without purchase
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExits = await redis.get("allCourses");

        if (isCacheExits) {
            const courses = JSON.parse(isCacheExits);
            res.status(200).json({
                success: true,
                courses,
            })
        } else {
            const courses = await CourseModel.find().select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            );

            await redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            })

        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// get course content -- only for registered users
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.course;
        const courseId = req.params.id;

        const courseExists = userCourseList?.find(
            (course: any) => course._id.toString() === courseId
        );

        if (!courseExists) {
            return next(new ErrorHandler("You are not eligible to access this course.", 404));
        }

        const course = await CourseModel.findById(courseId);
        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));

    }
});

// add question in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id.", 400))
        }
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id.", 400))
        }

        // create a new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        }

        // add this question to our course content
        courseContent.questions.push(newQuestion);

        // save the updated course
        await course?.save();

        res.status(200).json({
            success: true,
            course,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// add answer in course question
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;

        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id.", 400))
        }
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id.", 400))
        }

        const question = courseContent?.questions?.find((item: any) => item._id.equals(questionId));

        if (!question) {
            return next(new ErrorHandler("Invalid question id.", 400));
        }

        // create a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        }

        // add this question to our course content
        question.questionReplies?.push(newAnswer);

        await NotificationModel.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have new question from ${courseContent?.title}`,
        })

        // save the updated course
        await course?.save();

        if (req.user?._id === question.user._id) {
            // create a notification for answer
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have new question from ${courseContent?.title}`,
            });
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
            const html = await ejs.renderFile(path.join(__dirname, "../mails/questionReply.ejs"), data);

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "questionReply.ejs",
                    data,
                });
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 400));
            }
        }

        res.status(200).json({
            success: true,
            course: course,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// add review in course
interface IAddReviewData {
    courseId: string;
    review: string;
    rating: string;
    userId: string;
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.course;

        const courseId = req.params.id;

        // check if courseId already exists in userCousrseList based on _id
        const courseExists = userCourseList?.some((course: any) => course._id.toString() === courseId.toString());

        if (!courseExists) {
            return next(new ErrorHandler("You are not eligible to access this course.", 404))
        };

        const course = await CourseModel.findById(courseId);

        const { review, rating } = req.body as IAddReviewData;

        const reviewData: any = {
            user: req.user,
            rating,
            comment: review,
        }

        course?.reviews.push(reviewData);

        let avg = 0;
        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        })

        if (course) {
            course.ratings = avg / course.reviews.length;
        }

        await course?.save();

        const notification = {
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}.`,
        }

        res.status(200).json({
            success: true,
            course: course,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));

    }
});

// add reply to review
interface IAddReviewReplyData {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const replyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as IAddReviewReplyData;

        const course = await CourseModel.findById(courseId);

        if (!courseId) {
            return next(new ErrorHandler("Course not found.", 404));
        }

        const review = course?.reviews?.find(
            (rev: any) => rev._id.toString() === reviewId
        )
        if (!review) {
            return next(new ErrorHandler("Review not found.", 404));
        }

        const replyData: any = {
            user: req.user,
            comment,
        }

        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);

        await course?.save();

        res.status(200).json({
            success: true,
            course,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Get all course -- only for admin
export const getAllCoursesAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllCoursesService(res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// Delete course --- only Admin
export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.findById(id);

        if (!course) {
            return next(new ErrorHandler("Course not found", 400));
        }
        await course.deleteOne({ id });
        await redis.del(id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully."
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

// generate video url
export const generateVideoUrl = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.body;
        if (!videoId) {
            return next(new ErrorHandler("Video ID is required", 400));
        }

        const response = await axios.post(
            `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
            {
                ttl: 300
            }, {
            headers: {
                Accept: 'application/json',
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        }
        )
        res.status(200).json(response.data);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});