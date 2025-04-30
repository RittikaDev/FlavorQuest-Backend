import prisma from "../../../share/prisma";

import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";
import { IFile } from "../../interfaces/file";
import { PostStatus } from "@prisma/client";

// CREATE A POST
const createPost = async (user: IAuthUser, req: Request) => {
	const { title, description, location, price, image, category } = req.body;
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
			price,
			image: imagetoUpload,
			category,
			userId: userData.id,
		},
		select: {
			id: true,
			title: true,
			location: true,
			price: true,
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

export const PostService = {
	createPost,
	updatePostStatus,
};
