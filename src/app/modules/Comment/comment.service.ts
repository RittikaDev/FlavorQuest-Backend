import prisma from "../../../share/prisma";

const createComment = async (
	userEmail: string,
	postId: string,
	text: string
) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: { email: userEmail },
	});

	// console.log("User Data: ", userData);
	// console.log("post Data: ", postId);

	return await prisma.comment.create({
		data: {
			text,
			post: { connect: { id: postId } },
			user: { connect: { id: userData.id } },
		},
	});
};
const getCommentsByPostId = async (postId?: string) => {
	const whereClause = postId ? { postId } : {}; // IF POSTID IS PROVIDED, FILTER BY IT, OTHERWISE GET ALL

	return await prisma.comment.findMany({
		where: whereClause,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					profilePhoto: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

export const CommentService = {
	createComment,
	getCommentsByPostId,
};
