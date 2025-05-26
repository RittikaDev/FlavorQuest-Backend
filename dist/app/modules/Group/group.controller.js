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
exports.GroupController = void 0;
const group_service_1 = require("./group.service");
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const createGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { name, memberIds } = req.body;
    const owner = req === null || req === void 0 ? void 0 : req.user;
    const group = yield group_service_1.GroupService.createGroup(owner, req.body);
    res.status(201).json(group);
}));
const getMyGroups = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const groups = yield group_service_1.GroupService.getUserGroups(user);
    res.status(200).json(groups);
}));
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userId } = req.body;
    const member = yield group_service_1.GroupService.addMemberToGroup(groupId, userId);
    res.status(200).json(member);
});
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId, userId } = req.params;
    yield group_service_1.GroupService.removeMemberFromGroup(groupId, userId);
    res.status(204).send();
});
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    yield group_service_1.GroupService.deleteGroup(groupId);
    res.status(204).send();
});
exports.GroupController = {
    createGroup,
    getMyGroups,
    addMember,
    removeMember,
    deleteGroup,
};
