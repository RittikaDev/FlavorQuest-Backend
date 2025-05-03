import { Request, Response } from "express";

import httpStatus from "http-status";

import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";

import { userServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createUser(req);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "User created succesfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsers(req);
  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Get all Users retrived succesfully",
    data: result,
  });
});

const getSpecificUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getSpecificUser(req);
  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Get specific user retrived succesfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getMyProfile(req);
  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "User profile retrived succesfully",
    data: result,
  });
});

const updateAUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updateUser(req);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "User updated succesfully",
    data: result,
  });
});

const deleteAUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.deleteUser(req);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "User deleted succesfully",
    data: result,
  });
});

const blockAUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.blockUser(req);
  const message =
    result.status === "BLOCKED"
      ? "User has been blocked succesfully"
      : "User is again active";

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: message,
    data: result,
  });
});

export const usersControllers = {
  createUser,
  getAllUsers,
  getSpecificUser,
  updateAUser,
  blockAUser,
  getMyProfile,
  deleteAUser,
};
