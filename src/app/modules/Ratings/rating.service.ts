import prisma from "../../../share/prisma";

const upsertRating = async (
	userEmail: string,
	postId: string,
	score: number
) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: { email: userEmail },
	});

	return await prisma.rating.upsert({
		where: {
			userId_postId: {
				userId: userData.id,
				postId,
			},
		},
		update: { score },
		create: {
			userId: userData.id,
			postId,
			score,
		},
		include: {
			post: true,
			user: true,
		},
	});
};

const getRatingsByPostId = async (postId: string) => {
	return await prisma.rating.findMany({
		where: { postId },
		include: {
			post: true,
			user: true,
		},
	});
};

export const RatingServices = {
	upsertRating,
	getRatingsByPostId,
};
