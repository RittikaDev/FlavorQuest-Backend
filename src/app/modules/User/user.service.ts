import { Request } from "express";
import * as bcrypt from "bcrypt";

import prisma from "../../../share/prisma";
import { Prisma, UserStatus } from "@prisma/client";

import { IFile } from "../../interfaces/file";
import { IAuthUser } from "../../interfaces/common";

import {
	usersFilterableFields,
	usersFilterableOptions,
	usersSearchAbleFields,
} from "./user.constant";
import pick from "../../../share/pick";

import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";

const createUser = async (req: Request) => {
	const existingUser = await prisma.user.findUnique({
		where: {
			email: req.body.email,
		},
	});

	// If user exists, throw an error or handle it as needed
	if (existingUser) throw new Error("User with this email already exists");

	const file = req.file as IFile;

	let profilePhoto = null;
	if (file) profilePhoto = file.path;

	const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

	const userData = {
		name: req.body.name,
		email: req.body.email,
		contactNumber: req.body.contactNumber,
		role: req.body.role,
		profilePhoto: profilePhoto,
		password: hashedPassword,
	};

	const result = await prisma.user.create({
		data: userData,
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return result;
};

const getAllUsers = async (req: Request) => {
	const filters = pick(req.query, usersFilterableFields);
	const options = pick(req.query, usersFilterableOptions);
	const { page, limit, skip } = paginationHelper.calculatePagination(options);
	const { searchTerm, ...filterData } = filters;

	const andConditions: Prisma.UserWhereInput[] = [
		{ status: UserStatus.ACTIVE },
	];

	if (searchTerm) {
		andConditions.push({
			OR: usersSearchAbleFields.map((field) => ({
				[field]: {
					contains: searchTerm,
					mode: "insensitive",
				},
			})),
		});
	}

	if (Object.keys(filterData).length > 0) {
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: (filterData as any)[key],
				},
			})),
		});
	}

	const whereConditons: Prisma.UserWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const sortBy = options.sortBy || "createdAt";
	const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";

	const allUsers = await prisma.user.findMany({
		where: whereConditons,
		skip,
		take: limit,
		orderBy: {
			[sortBy as string]: sortOrder,
		},
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			status: true,
			profilePhoto: true,
			contactNumber: true,

			createdAt: true,
			updatedAt: true,
		},
	});

	const total = await prisma.user.count({
		where: whereConditons,
	});

	return {
		paginateData: {
			total,
			limit,
			page,
		},
		data: allUsers,
	};
};

const getSpecificUser = async (req: Request) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: req.params.userId,
		},
		select: {
			id: true,
			email: true,
			name: true,
			profilePhoto: true,
			contactNumber: true,
			role: true,
			status: true,
		},
	});

	return user;
};

const getMyProfile = async (req: Request & { user?: IAuthUser }) => {
	const userEmail = req.user?.email;
	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			email: userEmail,
		},
		select: {
			id: true,
			email: true,
			name: true,
			profilePhoto: true,
			contactNumber: true,
			role: true,
			status: true,
		},
	});

	return userInfo;
};

const updateUser = async (req: Request & { user?: IAuthUser }) => {
	try {
		const file = req.file as IFile | undefined;

		const user = await prisma.user.findUniqueOrThrow({
			where: { email: req.user?.email },
			select: { id: true },
		});

		console.log(user);

		if (!user) throw new Error("User is Not Found");

		const updateData: Record<string, any> = { ...req.body };
		console.log(req, updateData);
		if (file) updateData.profilePhoto = file.path;

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: updateData,
		});

		return updatedUser;
	} catch (error) {
		console.error("Error updating user:", error);
	}
};

const deleteUser = async (req: Request) => {
	try {
		const userId = req.params.userId;

		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) throw new Error("User can not be found");

		if (existingUser.status === UserStatus.DELETED)
			throw new Error("User is already marked as deleted");

		const result = await prisma.user.update({
			where: { id: userId },
			data: {
				status: UserStatus.DELETED,
			},
		});

		return result;
	} catch (err) {
		throw new Error("An error occurred while marking the user as deleted");
	}
};

const blockUser = async (req: Request) => {
	try {
		const isNotExitsUser = await prisma.user.findUnique({
			where: {
				id: req.params.userId,
			},
		});
		console.log(isNotExitsUser);
		if (isNotExitsUser?.status === UserStatus.DELETED)
			throw new Error("User is already marked as deleted, can not be blocked");
		else if (!isNotExitsUser) throw new Error("User not found");

		const result = await prisma.user.update({
			where: {
				id: req.params.userId,
			},
			data: {
				status:
					isNotExitsUser.status === UserStatus.ACTIVE
						? UserStatus.BLOCKED
						: UserStatus.ACTIVE,
			},
		});

		return result;
	} catch (err: any) {
		throw new Error(err.message || "An unexpected error occurred");
	}
};

export const userServices = {
	createUser,
	getAllUsers,
	getSpecificUser,
	updateUser,
	deleteUser,
	blockUser,
	getMyProfile,
};
