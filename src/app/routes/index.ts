import express from "express";

import { UsersRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { PostRoutes } from "../modules/Posts/post.route";
import { CategoryRoutes } from "../modules/Category/category.route";
import { CommentRoutes } from "../modules/Comment/comment.route";
import { RatingRoutes } from "../modules/Ratings/rating.route";
import { VoteRoutes } from "../modules/Vote/vote.route";
import { SubscriptionRoutes } from "../modules/Subscription/subscription.route";
import { FriendRoutes } from "../modules/Friendequest/friendequest.route";

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
	{
		path: "/category",
		route: CategoryRoutes,
	},
	{
		path: "/comment",
		route: CommentRoutes,
	},
	{
		path: "/rating",
		route: RatingRoutes,
	},
	{
		path: "/vote",
		route: VoteRoutes,
	},
	{
		path: "/subscribe",
		route: SubscriptionRoutes,
	},
	{
		path: "/friend",
		route: FriendRoutes,
	},
];

allRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
