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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = __importDefault(require("../../../config"));
const emailSender_1 = __importDefault(require("./emailSender"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../share/prisma"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const isCorrectPassword = yield bcrypt.compare(payload.password, userData.password);
    if (!isCorrectPassword)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Password is incorrect");
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: userData.email,
        id: userData.id,
        role: userData.role,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: userData.email,
        id: userData.id,
        role: userData.role,
    }, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in);
    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_token_secret);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
    }
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        email: userData.email,
        id: userData.id,
        role: userData.role,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange,
    };
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const isCorrectPassword = yield bcrypt.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Password is incorrect");
    const hashedPassword = yield bcrypt.hash(payload.newPassword, 12);
    yield prisma_1.default.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
        },
    });
    return {
        message: "Password changed successfully!",
    };
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const resetPassToken = jwtHelpers_1.jwtHelpers.generateToken({ email: userData.email, role: userData.role }, config_1.default.jwt.reset_pass_secret, config_1.default.jwt.reset_pass_token_expires_in);
    const resetPassLink = config_1.default.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;
    yield (0, emailSender_1.default)(userData.email, `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #2c3e50;">FlavorQuest - Password Reset</h2>
        <p>Hi <strong>${userData.name || "there"}</strong>,</p>
        <p>You requested to reset your password. Click the button below to continue:</p>

        <a href="${resetPassLink}" style="text-decoration: none;">
          <div style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: white; font-weight: bold; border-radius: 5px; margin-top: 10px;">
            Reset Password
          </div>
        </a>

        <p style="margin-top: 20px;">If the button doesn’t work, copy and paste the link below into your browser:</p>
        <p><a href="${resetPassLink}" style="color: #3498db;">${resetPassLink}</a></p>

        <p style="margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #888;">– The FlavorQuest Team</p>
      </div>
    `);
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    let userExists = yield prisma_1.default.user.findUnique({
        where: {
            id: payload.id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userExists)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    const isValidToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.reset_pass_secret);
    if (!isValidToken)
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    const password = yield bcrypt.hash(payload.password, 12);
    yield prisma_1.default.user.update({
        where: {
            id: payload.id,
        },
        data: {
            password,
        },
    });
});
exports.AuthServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
};
