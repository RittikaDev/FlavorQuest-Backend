import prisma from "../../../share/prisma";

import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";
import { IFile } from "../../interfaces/file";
import { PostStatus, Prisma, UserRole } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";

// CREATE A POST
const createPost = async (user: IAuthUser, req: Request) => {
  const { title, description, location, minPrice, maxPrice, categoryId } =
    req.body;

  // USER DATA
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // CHECK IF THE CATEGORYID EXISTS IN THE CATEGORY TABLE
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!categoryExists) throw new Error("Invalid category ID");

  // FILE UPLOAD
  const file = req.file as IFile;
  let imagetoUpload: string = "";
  if (file) imagetoUpload = file.path;

  const post = await prisma.foodPost.create({
    data: {
      title,
      description,
      location,
      minPrice,
      maxPrice,
      image: imagetoUpload,
      categoryId: categoryId,
      userId: userData.id,
    },
    select: {
      id: true,
      title: true,
      location: true,
      minPrice: true,
      maxPrice: true,
      status: true,
      isPremium: true,
      createdAt: true,
    },
  });

  return post;
};

// UPDATE POST
const updatePostByUser = async (
  user: IAuthUser,
  req: Request,
  postId: string
) => {
  const { title, description, location, minPrice, maxPrice, categoryId } =
    req.body;

  console.log(postId);

  // USER DATA
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // GET THE EXISTING POST
  const existingPost = await prisma.foodPost.findUniqueOrThrow({
    where: { id: postId },
  });

  // ENSURE THE LOGGED-IN USER OWNS THE POST
  if (existingPost.userId !== userData.id)
    throw new Error("Unauthorized: You cannot update this post");

  //  CHECK IF CATEGORY ID EXISTS IF UPDATED
  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) throw new Error("Invalid category ID");
  }

  // FILE UPLOAD
  const file = req.file as IFile;
  let updatedImage = existingPost.image;
  if (file) updatedImage = file.path;

  const updatedPost = await prisma.foodPost.update({
    where: { id: postId },
    data: {
      title,
      description,
      location,
      minPrice,
      maxPrice,
      image: updatedImage,
      categoryId,
    },
    select: {
      id: true,
      title: true,
      location: true,
      minPrice: true,
      maxPrice: true,
      status: true,
      isPremium: true,
      updatedAt: true,
    },
  });

  return updatedPost;
};

// GET POST BY ID
const getPostById = async (id: string) => {
  const post = await prisma.foodPost.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
      ratings: true,
      votes: true,
    },
  });

  if (!post) throw new Error("Post not found");

  return post;
};

// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
const updatePostStatus = async (
  postId: string,
  data: Partial<{
    status: PostStatus;
    isPremium: boolean;
    adminComment: string;
  }>
) => {
  if (data.isPremium && data.status !== PostStatus.APPROVED)
    throw new Error(
      "Post must be approved before it can be marked as premium."
    );

  return prisma.foodPost.update({
    where: { id: postId },
    data: {
      ...data,
      status: data.status as PostStatus | undefined,
      adminComment: data.adminComment,
      isPremium: data.isPremium,
    },
  });
};

const getPosts = async (
  user: IAuthUser,
  filters: {
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
  },
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andConditions: Prisma.FoodPostWhereInput[] = [];

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // ONLY APPLY STATUS FILTER IF NOT ADMIN
  if (userData?.role !== UserRole.ADMIN) {
    andConditions.push({ status: "APPROVED" });

    // FILTER OUT PREMIUM POSTS IF USER IS NOT PREMIUM
    if (userData?.role !== UserRole.PREMIUM_USER) {
      andConditions.push({ isPremium: false });
    }
  }
  console.log(filters.searchTerm);
  // SEARCHTERM FILTER (title or category name)
  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        },
        {
          category: {
            is: {
              name: {
                contains: filters.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }
  // console.log(filters.category);
  // CATEGORY FILTER
  if (filters.category) {
    andConditions.push({
      category: {
        name: {
          contains: filters.category,
          mode: "insensitive",
        },
      },
    });
  }

  // PRICE RANGE FILTER
  // console.log(filters.minPrice, filters.maxPrice);
  // PRICE RANGE FILTER
  if (filters.minPrice || filters.maxPrice) {
    // Check if minPrice and maxPrice are valid and apply them in the where condition
    andConditions.push({
      AND: [
        filters.minPrice
          ? { minPrice: { gte: parseFloat(filters.minPrice.toString()) } }
          : {},
        filters.maxPrice
          ? { maxPrice: { lte: parseFloat(filters.maxPrice.toString()) } }
          : {},
      ],
    });
  }

  const whereCondition: Prisma.FoodPostWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const isSortByRating = sortBy === "rating";
  const isSortByUpvotes = sortBy === "upvotes";
  const isSortByNewest = sortBy === "newest";

  // Get the posts
  const posts = await prisma.foodPost.findMany({
    where: whereCondition,
    skip,
    take: limit,
    include: {
      user: true,
      category: true,
      ratings: true,
      votes: true,
    },
  });

  // Calculate the average rating and upvotes for each post
  const postsWithRatingAndUpvotes = await Promise.all(
    posts.map(async (post) => {
      // Calculate average rating
      const ratings = await prisma.rating.findMany({
        where: { postId: post.id },
        select: { score: true },
      });
      const averageRating =
        ratings.reduce((sum, rating) => sum + rating.score, 0) /
        (ratings.length || 1); // Avoid division by zero

      // Calculate upvotes (assuming VoteType.UPVOTE represents upvotes)
      const upvotesCount = post.votes.filter(
        (vote) => vote.type === "UPVOTE"
      ).length;

      return {
        ...post,
        averageRating,
        upvotesCount,
      };
    })
  );

  // Sort the posts based on the sort criteria (rating, upvotes, or newest)
  const sortedPosts = postsWithRatingAndUpvotes.sort((a, b) => {
    if (isSortByRating) {
      return (b.averageRating || 0) - (a.averageRating || 0); // Sort by average rating
    }
    if (isSortByUpvotes) {
      return b.upvotesCount - a.upvotesCount; // Sort by upvotes count
    }
    if (isSortByNewest) {
      // Sort by createdAt to get the most recent post first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0; // Default sorting if none of the criteria match
  });

  const total = await prisma.foodPost.count({
    where: whereCondition,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: sortedPosts,
  };
};

const getUserPosts = async (
  email: string,
  filters: {
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
  },
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const andConditions: Prisma.FoodPostWhereInput[] = [{ userId: userData.id }];

  // SEARCHTERM FILTER (title or category name)
  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        },
        {
          category: {
            is: {
              name: {
                contains: filters.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (filters.category) {
    andConditions.push({
      category: {
        name: {
          contains: filters.category,
          mode: "insensitive",
        },
      },
    });
  }

  // PRICE RANGE FILTER
  if (filters.minPrice || filters.maxPrice) {
    // Check if minPrice and maxPrice are valid and apply them in the where condition
    andConditions.push({
      AND: [
        filters.minPrice
          ? { minPrice: { gte: parseFloat(filters.minPrice.toString()) } }
          : {},
        filters.maxPrice
          ? { maxPrice: { lte: parseFloat(filters.maxPrice.toString()) } }
          : {},
      ],
    });
  }

  const whereCondition: Prisma.FoodPostWhereInput = {
    AND: andConditions,
  };

  const posts = await prisma.foodPost.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      user: true,
    },
  });

  const total = await prisma.foodPost.count({
    where: whereCondition,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: posts,
  };
};

// USER DASHBOARD STATISTICS
const getUserDashboardStats = async (userEmail: string) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: userEmail },
  });

  console.log(userData);
  // 1. GET ALL THE USER'S POSTS (ONLY IDS TO REDUCE LOAD)
  const posts = await prisma.foodPost.findMany({
    where: { userId: userData.id },
    select: { id: true },
  });

  const postIds = posts.map((post) => post.id);

  if (postIds.length === 0) {
    return {
      totalPosts: 0,
      totalUpvotes: 0,
      totalDownvotes: 0,
      totalRatings: 0,
      averageRating: 0,
    };
  }

  // 2. GET TOTAL UPVOTES AND DOWNVOTES ACROSS THESE POSTS
  const votes = await prisma.vote.findMany({
    where: { postId: { in: postIds } },
    select: { type: true },
  });

  const totalUpvotes = votes.filter((v) => v.type === "UPVOTE").length;
  const totalDownvotes = votes.filter((v) => v.type === "DOWNVOTE").length;

  // 3. GET ALL RATINGS ACROSS THESE POSTS
  const ratings = await prisma.rating.findMany({
    where: { postId: { in: postIds } },
    select: { score: true },
  });

  const totalRatings = ratings.length;
  const averageRating =
    ratings.reduce((sum, r) => sum + r.score, 0) / (totalRatings || 1);

  return {
    totalPosts: postIds.length,
    totalUpvotes,
    totalDownvotes,
    totalRatings,
    averageRating: Number(averageRating.toFixed(2)),
  };
};

const getAdminDashboardStats = async () => {
  const [postCount, userCount, ratingData, commentCount] = await Promise.all([
    prisma.foodPost.count(),
    prisma.user.count(),
    prisma.rating.aggregate({
      _sum: {
        score: true,
      },
      _avg: {
        score: true,
      },
    }),
    prisma.comment.count(),
  ]);

  return {
    postCount,
    userCount,
    totalRating: ratingData._sum.score ?? 0,
    averageRating: ratingData._avg.score ?? 0,
    commentCount,
  };
};

export const PostService = {
  createPost,
  updatePostByUser,
  getPostById,
  updatePostStatus,
  getPosts,
  getUserPosts,

  getUserDashboardStats,
  getAdminDashboardStats,
};
