import prisma from "../../../share/prisma";

import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";
import { IFile } from "../../interfaces/file";
import { PostStatus, Prisma, UserRole } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";

// CREATE A POST
const createPost = async (user: IAuthUser, req: Request) => {
	const { title, description, location, minPrice, maxPrice, category } =
		req.body;
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	});
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
			category,
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

// ADMIN CAN APPROVE, REJECT OR MAKE A POST PREMIUM
export const updatePostStatus = async (
	postId: string,
	data: Partial<{ status: PostStatus; isPremium: boolean }>
) => {
	return prisma.foodPost.update({
		where: { id: postId },
		data: {
			...data,
			status: data.status as PostStatus | undefined,
		},
	});
};

const getPosts = async (
	user: IAuthUser,
	filters: any,
	options: IPaginationOptions
) => {
	const { limit, page, skip, sortBy, sortOrder } =
		paginationHelper.calculatePagination(options);

	const andConditions: Prisma.FoodPostWhereInput[] = [];

	// ONLY APPROVED POSTS
	andConditions.push({ status: "APPROVED" });

	// IF USER IS NOT PREMIUM, HIDE PREMIUM POSTS
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	});
	if (userData?.role !== UserRole.PREMIUM_USER)
		andConditions.push({ isPremium: false });

	// FILTER BY TITLE (CASE-INSENSITIVE, PARTIAL MATCH)
	if (filters.title) {
		andConditions.push({
			title: {
				contains: filters.title,
				mode: "insensitive",
			},
		});
	}

	// FILTER BY CATEGORY
	if (filters.category) {
		andConditions.push({
			category: {
				equals: filters.category,
				mode: "insensitive",
			},
		});
	}

	// FILTER BY PRICE RANGE
	if (filters.minPrice || filters.maxPrice) {
		const priceRangeCondition: Prisma.FoodPostWhereInput = {
			OR: [
				{
					minPrice: {
						gte: Number(filters.minPrice) || undefined,
						lte: Number(filters.maxPrice) || undefined,
					},
				},
				{
					maxPrice: {
						gte: Number(filters.minPrice) || undefined,
						lte: Number(filters.maxPrice) || undefined,
					},
				},
			],
		};
		andConditions.push(priceRangeCondition);
	}

	const whereCondition: Prisma.FoodPostWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const posts = await prisma.foodPost.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy: { [sortBy]: sortOrder },
		include: {
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

export const PostService = {
	createPost,
	updatePostStatus,
	getPosts,
};
