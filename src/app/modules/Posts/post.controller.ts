import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PostService } from "./post.service";

const createPost = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await PostService.createPost(user as IAuthUser, req);

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Appointment booked successfully!",
      data: result,
    });
  }
);

export const PostController = {
  createPost,
};
