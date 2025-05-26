"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/User/user.route");
const auth_routes_1 = require("../modules/Auth/auth.routes");
const post_route_1 = require("../modules/Posts/post.route");
const category_route_1 = require("../modules/Category/category.route");
const comment_route_1 = require("../modules/Comment/comment.route");
const rating_route_1 = require("../modules/Ratings/rating.route");
const vote_route_1 = require("../modules/Vote/vote.route");
const subscription_route_1 = require("../modules/Subscription/subscription.route");
const friendequest_route_1 = require("../modules/Friendequest/friendequest.route");
const group_route_1 = require("../modules/Group/group.route");
const share_route_1 = require("../modules/Share/share.route");
const router = express_1.default.Router();
const allRoutes = [
    {
        path: "/users",
        route: user_route_1.UsersRoutes,
    },
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/post",
        route: post_route_1.PostRoutes,
    },
    {
        path: "/category",
        route: category_route_1.CategoryRoutes,
    },
    {
        path: "/comment",
        route: comment_route_1.CommentRoutes,
    },
    {
        path: "/rating",
        route: rating_route_1.RatingRoutes,
    },
    {
        path: "/vote",
        route: vote_route_1.VoteRoutes,
    },
    {
        path: "/subscribe",
        route: subscription_route_1.SubscriptionRoutes,
    },
    {
        path: "/friend",
        route: friendequest_route_1.FriendRoutes,
    },
    {
        path: "/groups",
        route: group_route_1.GroupRoutes,
    },
    {
        path: "/share",
        route: share_route_1.ShareRoutes,
    },
];
allRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
