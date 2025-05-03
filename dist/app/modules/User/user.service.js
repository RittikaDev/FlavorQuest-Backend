"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const bcrypt = __importStar(require("bcrypt"));
const prisma_1 = __importDefault(require("../../../share/prisma"));
const client_1 = require("@prisma/client");
const user_constant_1 = require("./user.constant");
const pick_1 = __importDefault(require("../../../share/pick"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const createUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({
        where: {
            email: req.body.email,
        },
    });
    // If user exists, throw an error or handle it as needed
    if (existingUser)
        throw new Error("User with this email already exists");
    const file = req.file;
    let profilePhoto = null;
    if (file)
        profilePhoto = file.path;
    const hashedPassword = yield bcrypt.hash(req.body.password, 12);
    const userData = {
        name: req.body.name,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
        role: req.body.role,
        profilePhoto: profilePhoto,
        password: hashedPassword,
    };
    const result = yield prisma_1.default.user.create({
        data: userData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return result;
});
const getAllUsers = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, user_constant_1.usersFilterableFields);
    const options = (0, pick_1.default)(req.query, user_constant_1.usersFilterableOptions);
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [
    // { status: UserStatus.ACTIVE },
    ];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.usersSearchAbleFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditons = andConditions.length > 0 ? { AND: andConditions } : {};
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
    const allUsers = yield prisma_1.default.user.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            profilePhoto: true,
            contactNumber: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditons,
    });
    return {
        paginateData: {
            total,
            limit,
            page,
        },
        data: allUsers,
    };
});
const getSpecificUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: req.params.userId,
        },
        select: {
            id: true,
            email: true,
            name: true,
            profilePhoto: true,
            contactNumber: true,
            role: true,
            status: true,
        },
    });
    return user;
});
const getMyProfile = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: userEmail,
        },
        select: {
            id: true,
            email: true,
            name: true,
            profilePhoto: true,
            contactNumber: true,
            role: true,
            status: true,
        },
    });
    return userInfo;
});
const updateUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const file = req.file;
        const user = yield prisma_1.default.user.findUniqueOrThrow({
            where: { email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email },
            select: { id: true },
        });
        console.log(user);
        if (!user)
            throw new Error("User is Not Found");
        const updateData = Object.assign({}, req.body);
        console.log(req, updateData);
        if (file)
            updateData.profilePhoto = file.path;
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: user.id },
            data: updateData,
        });
        return updatedUser;
    }
    catch (error) {
        console.error("Error updating user:", error);
    }
});
const deleteUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser)
            throw new Error("User can not be found");
        if (existingUser.status === client_1.UserStatus.DELETED)
            throw new Error("User is already marked as deleted");
        const result = yield prisma_1.default.user.update({
            where: { id: userId },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return result;
    }
    catch (err) {
        throw new Error("An error occurred while marking the user as deleted");
    }
});
const blockUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isNotExitsUser = yield prisma_1.default.user.findUnique({
            where: {
                id: req.params.userId,
            },
        });
        console.log(isNotExitsUser);
        if ((isNotExitsUser === null || isNotExitsUser === void 0 ? void 0 : isNotExitsUser.status) === client_1.UserStatus.DELETED)
            throw new Error("User is already marked as deleted, can not be blocked");
        else if (!isNotExitsUser)
            throw new Error("User not found");
        const result = yield prisma_1.default.user.update({
            where: {
                id: req.params.userId,
            },
            data: {
                status: isNotExitsUser.status === client_1.UserStatus.ACTIVE
                    ? client_1.UserStatus.BLOCKED
                    : client_1.UserStatus.ACTIVE,
            },
        });
        return result;
    }
    catch (err) {
        throw new Error(err.message || "An unexpected error occurred");
    }
});
exports.userServices = {
    createUser,
    getAllUsers,
    getSpecificUser,
    updateUser,
    deleteUser,
    blockUser,
    getMyProfile,
};
