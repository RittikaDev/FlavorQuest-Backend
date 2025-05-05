"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const rating_controller_1 = require("./rating.controller");
const rating_validation_1 = require("./rating.validation");
const router = express_1.default.Router();
router.post("/:postId", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER, client_1.UserRole.ADMIN), (req, res, next) => {
    req.body = rating_validation_1.RatingValidations.createOrUpdateRatingSchema.parse(req.body);
    return rating_controller_1.RatingController.ratePost(req, res, next);
});
router.get("/:postId", rating_controller_1.RatingController.getPostRatings);
exports.RatingRoutes = router;
