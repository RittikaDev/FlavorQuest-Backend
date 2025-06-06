import { UserRole } from "@prisma/client";
import prisma from "../../../share/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";

const createComment = async (
  userEmail: string,
  postId: string,
  text: string
) => {
  const userData = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  // console.log("User Data: ", userData);
  // console.log("post Data: ", postId);

  return await prisma.comment.create({
    data: {
      text,
      post: { connect: { id: postId } },
      user: { connect: { id: userData.id } },
    },
  });
};
const getCommentsByPostId = async (
  options: IPaginationOptions,
  postId?: string
) => {
  const whereClause = postId ? { postId } : {}; // IF POSTID IS PROVIDED, FILTER BY IT, OTHERWISE GET ALL

  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: whereClause }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: comments,
  };
};

const deleteCommentById = async (commentId: string, email: string) => {
  if (!commentId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Comment ID is required.");

  // GET THE USER TRYING TO DELETE THE COMMENT
  const userData = await prisma.user.findUnique({
    where: { email },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  // FIND THE COMMENT
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw new ApiError(httpStatus.NOT_FOUND, "Comment not found.");

  // IF NOT ADMIN, ONLY ALLOW THE COMMENT OWNER TO DELETE
  if (userData.role !== UserRole.ADMIN && comment.userId !== userData.id)
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to delete this comment."
    );

  // DELETE THE COMMENT
  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { message: "Comment deleted successfully." };
};

export const CommentService = {
  createComment,
  getCommentsByPostId,

  deleteCommentById,
};
