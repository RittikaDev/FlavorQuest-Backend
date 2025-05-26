import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createShare = async (
	senderId: string,
	receiverId: string | null,
	groupId: string | null,
	postId: string,
	message: string
) => {
	return await prisma.share.create({
		data: {
			senderId,
			receiverId,
			groupId,
			postId,
			message,
		},
	});
};

const getSharesByUser = async (userId: string) => {
	return await prisma.share.findMany({
		where: {
			senderId: userId,
			groupId: null,
		},
		include: {
			sender: true,
			post: {
				include: {
					user: true,
				},
			},
		},
	});
};

const getSharesByGroup = async (groupId: string) => {
	return await prisma.share.findMany({
		where: {
			groupId,
		},
		include: {
			sender: true,
			post: true,
		},
	});
};

export const ShareService = {
	createShare,
	getSharesByUser,
	getSharesByGroup,
};
