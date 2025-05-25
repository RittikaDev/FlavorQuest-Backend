import httpStatus from "http-status";
import prisma from "../../../share/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";

const sendFriendRequest = async (user: IAuthUser, receiverId: string) => {
	const userData = await prisma.user.findUnique({
		where: { email: user?.email },
	});

	if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

	let senderId = userData.id;

	if (senderId === receiverId)
		throw new Error("Cannot send request to yourself");

	const existing = await prisma.friendRequest.findUnique({
		where: {
			senderId_receiverId: { senderId, receiverId },
		},
	});

	if (existing) throw new Error("Request already sent");

	return prisma.friendRequest.create({
		data: { senderId, receiverId },
	});
};

const getMyFriendRequests = async (user: IAuthUser) => {
	const userData = await prisma.user.findUnique({
		where: { email: user?.email },
	});

	if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
	const userId = userData.id;

	const incoming = await prisma.friendRequest.findMany({
		where: { receiverId: userId, status: "PENDING" },
		include: { sender: true },
	});

	const outgoing = await prisma.friendRequest.findMany({
		where: { senderId: userId, status: "PENDING" },
		include: { receiver: true },
	});

	return { incoming, outgoing };
};

const respondToRequest = async (
	requestId: string,
	user: IAuthUser,
	action: "ACCEPTED" | "REJECTED"
) => {
	const userData = await prisma.user.findUnique({
		where: { email: user?.email },
	});

	if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
	const userId = userData.id;

	const request = await prisma.friendRequest.findUnique({
		where: { id: requestId },
	});

	console.log(request);

	if (!request) throw new Error("Request not found");
	if (request.receiverId !== userId) throw new Error("Not authorized");

	return prisma.friendRequest.update({
		where: { id: requestId },
		data: { status: action },
	});
};

export const FriendequestService = {
	sendFriendRequest,
	getMyFriendRequests,
	respondToRequest,
};
