import express from "express";

import { UsersRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { PostRoutes } from "../modules/Posts/post.route";

const router = express.Router();

const allRoutes = [
  {
    path: "/users",
    route: UsersRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/post",
    route: PostRoutes,
  },
];

allRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
