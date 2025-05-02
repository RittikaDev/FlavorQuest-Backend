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
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../share/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../share/sendResponse"));
const createCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    // console.log(name);
    try {
        const category = yield category_service_1.CategoryService.createCategory(name);
        return (0, sendResponse_1.default)(res, {
            success: true,
            status: http_status_1.default.CREATED,
            message: "Category created successfully",
            data: category,
        });
    }
    catch (error) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.INTERNAL_SERVER_ERROR,
            message: "Something went wrong",
        });
    }
}));
const getCategories = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_service_1.CategoryService.getCategories();
        return (0, sendResponse_1.default)(res, {
            success: true,
            status: http_status_1.default.OK,
            message: "Categories retrieved successfully",
            data: categories,
        });
    }
    catch (error) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.INTERNAL_SERVER_ERROR,
            message: "Something went wrong",
        });
    }
}));
const deleteCategoryById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const catId = req.params.id;
    const result = yield category_service_1.CategoryService.deleteCategoryById(catId, userEmail);
    if (!result)
        return (0, sendResponse_1.default)(res, {
            success: false,
            status: http_status_1.default.NOT_FOUND,
            message: "No post found with this ID!",
            data: null,
        });
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_1.default.OK,
        message: "Post deleted successfully!",
        data: null,
    });
}));
exports.CategoryController = {
    createCategory,
    getCategories,
    deleteCategoryById,
};
