"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const multer_config_1 = require("../../../config/multer.config");
const router = express_1.default.Router();
router.post("/register", multer_config_1.multerUpload.single("file"), (req, res, next) => {
    const data = JSON.parse(req.body.data);
    req.body = user_validation_1.userValidation.createUserValidation.parse(data);
    return user_controller_1.usersControllers.createUser(req, res, next);
});
router.get("/", (0, auth_1.default)(client_1.UserRole.ADMIN), user_controller_1.usersControllers.getAllUsers);
router.get("/my-profile", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), user_controller_1.usersControllers.getMyProfile);
router.get("/:userId", user_controller_1.usersControllers.getSpecificUser);
router.put("/update", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.USER, client_1.UserRole.PREMIUM_USER), multer_config_1.multerUpload.single("file"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    return user_controller_1.usersControllers.updateAUser(req, res, next);
});
router.delete("/delete/:userId", (0, auth_1.default)(client_1.UserRole.ADMIN), user_controller_1.usersControllers.deleteAUser);
router.delete("/block/:userId", (0, auth_1.default)(client_1.UserRole.ADMIN), user_controller_1.usersControllers.blockAUser);
exports.UsersRoutes = router;
