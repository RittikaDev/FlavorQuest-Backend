import { PrismaClient } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
const prisma = new PrismaClient();

const createGroup = async (
	user: IAuthUser,
	payload: { name: string; memberIds: string[] }
) => {
	const userData = await prisma.user.findUnique({
		where: { email: user?.email },
	});
	if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

	const creatorId = userData.id;

	console.log(payload);
	// Ensure the creator is included in the group members
	const allMemberIds = Array.from(new Set([...payload.memberIds, creatorId]));

	console.log("Creating group with members:", allMemberIds);

	const group = await prisma.group.create({
		data: {
			name: payload.name,
			owner: {
				connect: { id: creatorId },
			},
			members: {
				create: allMemberIds.map((id) => ({
					user: {
						connect: { id },
					},
				})),
			},
		},
		include: {
			members: { include: { user: true } },
		},
	});

	return group;
};

const getUserGroups = async (user: IAuthUser) => {
	// USER DATA
	const userData = await prisma.user.findUnique({
		where: { email: user?.email },
	});

	if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

	const userId = userData.id;

	return await prisma.group.findMany({
		where: {
			members: {
				some: {
					userId,
				},
			},
		},
		include: {
			members: {
				include: { user: true },
			},
		},
	});
};
const addMemberToGroup = async (groupId: string, userId: string) => {
	// Check if the user is already a member of the group
	const existingMember = await prisma.groupMember.findFirst({
		where: {
			groupId,
			userId,
		},
	});

	if (existingMember) {
		return {
			success: false,
			message: "User is already a member of the group.",
		};
	}

	// Add new member to the group
	const newMember = await prisma.groupMember.create({
		data: {
			groupId,
			userId,
		},
	});

	return {
		success: true,
		message: "Member added successfully.",
		data: newMember,
	};
};

const removeMemberFromGroup = async (groupId: string, userId: string) => {
	return await prisma.groupMember.deleteMany({
		where: {
			groupId,
			userId,
		},
	});
};

const deleteGroup = async (groupId: string) => {
	await prisma.groupMember.deleteMany({ where: { groupId } });
	return await prisma.group.delete({ where: { id: groupId } });
};

export const GroupService = {
	createGroup,
	getUserGroups,
	addMemberToGroup,
	removeMemberFromGroup,
	deleteGroup,
};
