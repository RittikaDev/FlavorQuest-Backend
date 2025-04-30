"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const vote_controller_1 = require("./vote.controller");
const vote_validation_1 = require("./vote.validation");
const router = express_1.default.Router();
// 
router.post("/:postId", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), (req, res, next) => {
    req.body = vote_validation_1.VoteValidation.createVoteSchema.parse(req.body);
    return vote_controller_1.VoteController.vote(req, res, next);
});
router.delete("/:postId", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), vote_controller_1.VoteController.unvote);
exports.VoteRoutes = router;
