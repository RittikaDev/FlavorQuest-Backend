import { Request, Response } from "express";
import httpStatus from "http-status";

import { CommentService } from "./comment.service";

import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";

import { IAuthUser } from "../../interfaces/common";
import pick from "../../../share/pick";

const createComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userEmail = req.user?.email;

    const { text } = req.body;
    const { postId } = req.params;

    const result = await CommentService.createComment(userEmail!, postId, text);

    sendResponse(res, {
      success: true,
      status: httpStatus.CREATED,
      message: "Comment Created successfully!",
      data: result,
    });
  }
);

const getPostComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await CommentService.getCommentsByPostId(options, postId);
  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Comment retrieved successfully!",
    data: result,
  });
});

const deleteCommentById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userEmail = req.user?.email;
    const commentId = req.params.commentId;

    const result = await CommentService.deleteCommentById(
      commentId,
      userEmail!
    );
    if (!result)
      return sendResponse(res, {
        success: false,
        status: httpStatus.NOT_FOUND,
        message: "No comment found with this ID!",
        data: null,
      });

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Comment deleted successfully!",
      data: null,
    });
  }
);

export const CommentController = {
  createComment,
  getPostComments,

  deleteCommentById,
};
