import express from "express";
import home from "./home";
import api from "./api";
import {htmlHandler} from "../errors/handlers";
import authenticate from "./authenticate";
import register from "./register";
import {redirect, sessionAuthenticationGuard} from "../auth/authenticationMiddleware";
import createPost from "./createPost";
import likes from "./likes";

const router = express.Router();

router.get("/", home);
router.use("/create-post", sessionAuthenticationGuard(redirect("authenticate")));
router.use("/create-post", createPost);
router.use("/authenticate", authenticate);
router.use("/register", register);
router.use("/likes", sessionAuthenticationGuard(redirect("authenticate")));
router.use("/likes", likes);
router.use(htmlHandler({}));
router.use("/api", api);

export default router;
