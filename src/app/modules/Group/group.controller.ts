import { Request, Response } from "express";
import { GroupService } from "./group.service";
import catchAsync from "../../../share/catchAsync";
import { IAuthUser } from "../../interfaces/common";

const createGroup = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		// const { name, memberIds } = req.body;
		const owner = req?.user;

		const group = await GroupService.createGroup(owner as IAuthUser, req.body);
		res.status(201).json(group);
	}
);

const getMyGroups = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const groups = await GroupService.getUserGroups(user as IAuthUser);
		res.status(200).json(groups);
	}
);

const addMember = async (req: Request, res: Response) => {
	const { groupId } = req.params;
	const { userId } = req.body;
	const member = await GroupService.addMemberToGroup(groupId, userId);
	res.status(200).json(member);
};

const removeMember = async (req: Request, res: Response) => {
	const { groupId, userId } = req.params;
	await GroupService.removeMemberFromGroup(groupId, userId);
	res.status(204).send();
};

const deleteGroup = async (req: Request, res: Response) => {
	const { groupId } = req.params;
	await GroupService.deleteGroup(groupId);
	res.status(204).send();
};

export const GroupController = {
	createGroup,
	getMyGroups,
	addMember,
	removeMember,
	deleteGroup,
};
