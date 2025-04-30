import prisma from "../../../share/prisma";

import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";
import { IFile } from "../../interfaces/file";

export const createPost = async (user: IAuthUser, req: Request) => {
  const { title, description, location, price, image, category } = req.body;
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const file = req.file as IFile;
  let imagetoUpload: string = "";
  if (file) imagetoUpload = file.path;

  const post = await prisma.foodPost.create({
    data: {
      title,
      description,
      location,
      price,
      image: imagetoUpload,
      category,
      userId: userData.id,
    },
    select: {
      id: true,
      title: true,
      location: true,
      price: true,
      status: true,
      isPremium: true,
      createdAt: true,
    },
  });

  return post;
};

export const PostService = {
  createPost,
};
