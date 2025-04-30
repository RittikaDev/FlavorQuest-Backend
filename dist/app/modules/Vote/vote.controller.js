"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteController = void 0;
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const vote_service_1 = require("./vote.service");
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../../share/sendResponse"));
const vote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.params;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const { type } = req.body;
    const result = yield vote_service_1.VoteServices.upsertVote(userEmail, postId, type);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Voted successfully!",
        data: result,
    });
}));
const unvote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    console.log(userEmail);
    const { postId } = req.params;
    const result = yield vote_service_1.VoteServices.removeVote(userEmail, postId);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Vote Removed!",
        data: result,
    });
}));
// const getCounts = catchAsync(
// async (req: Request & { user?: IAuthUser }, res: Response) => {
// 	const { postId } = req.params;
// 	try {
// 		const counts = await voteService.getVoteCounts(postId);
// 		res.status(200).json(counts);
// 	} catch (err) {
// 		res.status(500).json({ error: "Failed to fetch vote counts" });
// 	}
// });
exports.VoteController = {
    vote,
    unvote,
};
