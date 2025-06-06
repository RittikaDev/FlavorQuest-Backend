import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../share/catchAsync";
import sendResponse from "../../../share/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PostService } from "./post.service";
import { PostStatus } from "@prisma/client";
import pick from "../../../share/pick";
import { postFilterableFields } from "./post.constants";
import ApiError from "../../errors/ApiError";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";

// CREATE A POST
const createPost = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await PostService.createPost(user as IAuthUser, req);

    sendResponse(res, {
      success: true,
      status: httpStatus.CREATED,
      message: "Post Created successfully!",
      data: result,
    });
  }
);

// UPDATE POST BY USER
const updatePostByUser = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const postId = req.params.id;

    const result = await PostService.updatePostByUser(
      user as IAuthUser,
      req,
      postId
    );

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Post updated successfully!",
      data: result,
    });
  }
);

// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const { status, isPremium, adminComment } = req.body;
  // console.log(status);

  const updateData: Partial<{
    status: PostStatus;
    adminComment: string;
    isPremium: boolean;
  }> = {};
  if (status) updateData.status = status;
  if (adminComment) updateData.adminComment = adminComment;
  if (typeof isPremium === "boolean") updateData.isPremium = isPremium;

  const result = await PostService.updatePostStatus(postId, updateData);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Post updated successfully!",
    data: result,
  });
});

const getPosts = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    // console.log(req.headers);

    const token = req.headers.authorization?.split(" ")[1];
    let verifiedUser;
    if (token) {
      verifiedUser = jwtHelpers.verifyToken(
        token!,
        config.jwt.jwt_secret as Secret
      );
    }
    // console.log("user", verifiedUser);
    const user = verifiedUser ?? null;

    const filters = pick(req.query, postFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await PostService.getPosts(user, filters, options);

    const isFiltering = Object.values(filters).some(
      (val) => val !== undefined && val !== ""
    );

    if (result.data.length === 0) {
      if (!isFiltering) {
        // NO FILTERS AND NO DATA → RETURN 404
        return sendResponse(res, {
          success: false,
          status: httpStatus.NOT_FOUND,
          message: "No posts found!",
          data: null,
        });
      } else {
        // FILTERS APPLIED BUT NO MATCH → RETURN 200 WITH EMPTY DATA
        return sendResponse(res, {
          success: true,
          status: httpStatus.OK,
          message: "No posts found matching your filters.",
          data: {
            meta: {
              total: 0,
              page: options.page || 1,
              limit: options.limit || 10,
            },
            data: [],
          },
        });
      }
    }

    // DATA EXISTS
    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Posts retrieved successfully",
      data: result,
    });
  }
);

const getAdminPosts = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const filters = pick(req.query, postFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    if (!user)
      throw new ApiError(httpStatus.UNAUTHORIZED, "User is not authenticated");

    const result = await PostService.getPosts(user, filters, options);

    const isFiltering = Object.values(filters).some(
      (val) => val !== undefined && val !== ""
    );

    if (result.data.length === 0) {
      if (!isFiltering) {
        // NO FILTERS AND NO DATA → RETURN 404
        return sendResponse(res, {
          success: false,
          status: httpStatus.NOT_FOUND,
          message: "No posts found!",
          data: null,
        });
      } else {
        // FILTERS APPLIED BUT NO MATCH → RETURN 200 WITH EMPTY DATA
        return sendResponse(res, {
          success: true,
          status: httpStatus.OK,
          message: "No posts found matching your filters.",
          data: {
            meta: {
              total: 0,
              page: options.page || 1,
              limit: options.limit || 10,
            },
            data: [],
          },
        });
      }
    }

    // DATA EXISTS
    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Posts retrieved successfully",
      data: result,
    });
  }
);

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;

  const result = await PostService.getPostById(postId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Specific post retrieved successfully",
    data: result,
  });
});

// UPDATE POST BY USER
const getUserPosts = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userEmail = req.user?.email;
    const filters = pick(req.query, postFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await PostService.getUserPosts(userEmail!, filters, options);

    const isFiltering = Object.values(filters).some(
      (val) => val !== undefined && val !== ""
    );

    if (result.data.length === 0) {
      if (!isFiltering) {
        // INITIAL LOAD (NO FILTERS/SEARCH APPLIED), RETURN 404
        return sendResponse(res, {
          success: false,
          status: httpStatus.NOT_FOUND,
          message: "No posts found for this user!",
          data: null,
        });
      } else {
        // FILTERS/SEARCH APPLIED, BUT NO MATCHING RESULT FOUND — RETURN SUCCESS WITH EMPTY DATA
        return sendResponse(res, {
          success: true,
          status: httpStatus.OK,
          message: "No posts found matching your filters.",
          data: {
            meta: {
              total: 0,
              page: options.page || 1,
              limit: options.limit || 10,
            },
            data: [],
          },
        });
      }
    }

    // DATA EXISTS
    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Post retrieved successfully!",
      data: result,
    });
  }
);

const getUserDashboardStats = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userEmail = req.user?.email;
    console.log(req.user);

    const result = await PostService.getUserDashboardStats(userEmail!);
    if (!result)
      return sendResponse(res, {
        success: false,
        status: httpStatus.NOT_FOUND,
        message: "No status found for this user!",
        data: null,
      });
    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "User statistics retrieved successfully!",
      data: result,
    });
  }
);

const getAdminDashboardStats = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await PostService.getAdminDashboardStats();
    if (!result)
      return sendResponse(res, {
        success: false,
        status: httpStatus.NOT_FOUND,
        message: "No status found for Admin!",
        data: null,
      });
    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Admin statistics retrieved successfully!",
      data: result,
    });
  }
);

const deletePostById = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userEmail = req.user?.email;
    const postId = req.params.postId;

    const result = await PostService.deletePostById(postId, userEmail!);
    if (!result)
      return sendResponse(res, {
        success: false,
        status: httpStatus.NOT_FOUND,
        message: "No post found with this ID!",
        data: null,
      });

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Post deleted successfully!",
      data: null,
    });
  }
);

export const PostController = {
  createPost,
  updatePostByUser,
  getPostById,
  updatePost,

  getPosts,
  getAdminPosts,
  getUserPosts,

  getUserDashboardStats,
  getAdminDashboardStats,

  deletePostById,
};
