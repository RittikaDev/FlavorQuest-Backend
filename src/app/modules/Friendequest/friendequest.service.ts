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

const getFriendSuggestions = async (user: IAuthUser) => {
  const userData = await prisma.user.findUnique({
    where: { email: user?.email },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  const userId = userData.id;

  const allUsers = await prisma.user.findMany({
    where: {
      id: {
        not: userId,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      // other fields if needed
    },
  });

  const friendRequests = await prisma.friendRequest.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
  });

  const requestMap = new Map<string, { status: string; isSender: boolean }>();

  friendRequests.forEach((req) => {
    const otherUserId = req.senderId === userId ? req.receiverId : req.senderId;
    const isSender = req.senderId === userId;

    requestMap.set(otherUserId, {
      status: req.status,
      isSender,
    });
  });

  const suggestions = allUsers
    .filter((user) => {
      const relation = requestMap.get(user.id);
      return !relation || relation.status !== "ACCEPTED";
    })
    .map((user) => {
      const relation = requestMap.get(user.id);
      return {
        id: user.id,
        name: user.name,
        friendRequestStatus: relation?.status || null,
        isSender: relation?.isSender ?? false,
      };
    });

  return suggestions;
};

const getFriendList = async (user: IAuthUser) => {
  const userData = await prisma.user.findUnique({
    where: { email: user?.email },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  const userId = userData.id;

  // FIND ALL ACCEPTED FRIEND REQUESTS WHERE USER IS SENDER OR RECEIVER
  const acceptedFriendRequests = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: { id: true, name: true, email: true, profilePhoto: true },
      },
      receiver: {
        select: { id: true, name: true, email: true, profilePhoto: true },
      },
    },
  });

  // MAP TO LIST OF FRIENDS (THE OTHER USER IN EACH REQUEST)
  const friends = acceptedFriendRequests.map((fr) => {
    // IF CURRENT USER IS SENDER, FRIEND IS RECEIVER, ELSE FRIEND IS SENDER
    return fr.senderId === userId ? fr.receiver : fr.sender;
  });

  return friends;
};

const removeFriend = async (user: IAuthUser, friendId: string) => {
  const userData = await prisma.user.findUnique({
    where: { email: user?.email },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  const userId = userData.id;

  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
  });

  if (!existingRequest)
    throw new ApiError(httpStatus.NOT_FOUND, "Friend relationship not found");

  await prisma.friendRequest.delete({
    where: { id: existingRequest.id },
  });

  return { message: "Friend removed successfully" };
};

export const FriendequestService = {
  sendFriendRequest,
  getMyFriendRequests,
  respondToRequest,

  getFriendSuggestions,
  getFriendList,
  removeFriend,
};
