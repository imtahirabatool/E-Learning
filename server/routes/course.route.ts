import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { addAnswer, addQuestion, addReview, deleteCourse, editCourse, generateVideoUrl, getAllCourses, getAllCoursesAdmin, getCourseByUser, getSingleCourse, replyToReview, uploadCourse } from "../controller/course.controller";
import { updateAccessToken } from "../controller/user.controller";

const courseRouter = express.Router();

courseRouter.post("/create-course", updateAccessToken, isAuthenticated, authorizeRoles("admin"), uploadCourse)
courseRouter.put("/edit-course/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), editCourse)
courseRouter.get("/get-course/:id", getSingleCourse)
courseRouter.get("/get-courses", getAllCourses)
courseRouter.get("/get-course-content/:id", updateAccessToken, isAuthenticated, getCourseByUser)
courseRouter.put("/add-question", updateAccessToken, isAuthenticated, addQuestion)
courseRouter.put("/add-answer", updateAccessToken, isAuthenticated, addAnswer)
courseRouter.put("/add-review/:id", updateAccessToken, isAuthenticated, addReview)
courseRouter.put("/add-reply", updateAccessToken, isAuthenticated, authorizeRoles("admin"), replyToReview)
courseRouter.post("/getVdoCipherOTP", generateVideoUrl)
courseRouter.get("/get-all-courses", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllCoursesAdmin)
courseRouter.delete("/delete-course/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), deleteCourse)

export default courseRouter;