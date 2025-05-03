import httpStatus from "http-status";
import prisma from "../../../share/prisma";
import ApiError from "../../errors/ApiError";

const upsertRating = async (
  userEmail: string,
  postId: string,
  score: number
) => {
  const userData = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  return await prisma.rating.upsert({
    where: {
      userId_postId: {
        userId: userData.id,
        postId,
      },
    },
    update: { score },
    create: {
      userId: userData.id,
      postId,
      score,
    },
    include: {
      post: true,
      user: true,
    },
  });
};

const getRatingsByPostId = async (postId: string) => {
  return await prisma.rating.findMany({
    where: { postId },
    include: {
      post: true,
      user: true,
    },
  });
};

export const RatingServices = {
  upsertRating,
  getRatingsByPostId,
};
