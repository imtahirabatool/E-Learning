import express from "express";
import {
    activateUser,
    deleteUser,
    getAllUsersAdmin,
    getUserInfo,
    loginUser,
    logoutUser,
    registrationUser,
    socialAuth,
    updateAccessToken,
    updatePassword,
    updateProfilePicture,
    updateUserInfo,
    updateUserRole
} from "../controller/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);
userRouter.post('/activate-user', activateUser);
userRouter.post('/login', loginUser);
userRouter.get('/logout', isAuthenticated, logoutUser);
userRouter.get('/refresh', updateAccessToken);
userRouter.get('/me', updateAccessToken, isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user-info", updateAccessToken, isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", updateAccessToken, isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar", updateAccessToken, isAuthenticated, updateProfilePicture);
userRouter.get('/get-all-users', updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllUsersAdmin);
userRouter.put('/update-user-role', updateAccessToken, isAuthenticated, authorizeRoles("admin"), updateUserRole);
userRouter.delete('/delete-user/:id', updateAccessToken, isAuthenticated, authorizeRoles("admin"), deleteUser);

export default userRouter;
