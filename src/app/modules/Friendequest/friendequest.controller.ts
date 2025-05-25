import { Request, Response } from "express";
import { FriendequestService } from "./friendequest.service";
import catchAsync from "../../../share/catchAsync";
import { IAuthUser } from "../../interfaces/common";

const sendRequest = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const { receiverId } = req.body;
		const senderId = req.user;

		try {
			const result = await FriendequestService.sendFriendRequest(
				senderId as IAuthUser,
				receiverId
			);
			res.status(201).json(result);
		} catch (err: any) {
			res.status(400).json({ message: err.message });
		}
	}
);

const getMyRequests = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const userId = req.user;
		const requests = await FriendequestService.getMyFriendRequests(
			userId as IAuthUser
		);
		res.json(requests);
	}
);

const respond = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const userId = req.user;
		const { status } = req.body;
		const { requestId } = req.params;
		console.log("Responding to request", requestId, "with status", status);
		console.log("User ID:", userId);
		try {
			const updated = await FriendequestService.respondToRequest(
				requestId,
				userId as IAuthUser,
				status
			);
			res.json(updated);
		} catch (err: any) {
			res.status(400).json({ message: err.message });
		}
	}
);
export const FriendequestController = {
	sendRequest,
	getMyRequests,
	respond,
};
