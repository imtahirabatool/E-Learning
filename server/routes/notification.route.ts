import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import { getNotifications, updateNotifications } from "../controller/notification.controller"
import { updateAccessToken } from "../controller/user.controller"

const notificationRouter = express.Router()

notificationRouter.get("/get-all-notifications", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getNotifications)
notificationRouter.put("/update-notifications/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), updateNotifications)

export default notificationRouter;