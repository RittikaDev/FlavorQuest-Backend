import { PrismaClient, VoteType } from "@prisma/client";
const prisma = new PrismaClient();

const upsertVote = async (
	userEmail: string,
	postId: string,
	type: VoteType
) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: { email: userEmail },
	});

	await prisma.foodPost.findUniqueOrThrow({
		where: { id: postId },
	});

	const existingVote = await prisma.vote.findFirst({
		where: { userId: userData.id, postId },
	});

	if (existingVote) {
		if (existingVote.type === type) return existingVote;
		else {
			return await prisma.vote.update({
				where: { id: existingVote.id },
				data: { type },
				include: {
					user: { select: { id: true, email: true } },
					post: true,
				},
			});
		}
	} else
		return await prisma.vote.create({
			data: { userId: userData.id, postId, type },
			include: {
				user: { select: { id: true, email: true } },
				post: true,
			},
		});
};

const removeVote = async (userEmail: string, postId: string) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: { email: userEmail },
	});

	await prisma.foodPost.findUniqueOrThrow({
		where: { id: postId },
	});

	return await prisma.vote.deleteMany({
		where: { userId: userData.id, postId },
	});
};

// const getVoteCounts = async (postId: string) => {
// 	const [upvotes, downvotes] = await Promise.all([
// 		prisma.vote.count({ where: { postId, type: VoteType.UPVOTE } }),
// 		prisma.vote.count({ where: { postId, type: VoteType.DOWNVOTE } }),
// 	]);
// 	return { upvotes, downvotes };
// };

export const VoteServices = {
	upsertVote,
	removeVote,
	// getVoteCounts,
};
