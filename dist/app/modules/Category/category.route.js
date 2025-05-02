"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.ADMIN), (req, res, next) => {
    req.body = category_validation_1.CategoryValidations.createCategorySchema.parse(req.body);
    return category_controller_1.CategoryController.createCategory(req, res, next);
});
router.get("/", category_controller_1.CategoryController.getCategories);
router.delete("/delete/:catId", (0, auth_1.default)(client_1.UserRole.ADMIN), category_controller_1.CategoryController.deleteCategoryById);
exports.CategoryRoutes = router;
