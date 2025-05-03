import { UserStatus } from "@prisma/client";

import * as bcrypt from "bcrypt";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import emailSender from "./emailSender";

import httpStatus from "http-status";
import prisma from "../../../share/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiError";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      id: userData.id,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      id: userData.id,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }

  const userData = await prisma.user.findUnique({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      id: userData.id,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  const resetPassLink =
    config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  await emailSender(
    userData.email,
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #2c3e50;">FlavorQuest - Password Reset</h2>
        <p>Hi <strong>${userData.name || "there"}</strong>,</p>
        <p>You requested to reset your password. Click the button below to continue:</p>

        <a href="${resetPassLink}" style="text-decoration: none;">
          <div style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: white; font-weight: bold; border-radius: 5px; margin-top: 10px;">
            Reset Password
          </div>
        </a>

        <p style="margin-top: 20px;">If the button doesn’t work, copy and paste the link below into your browser:</p>
        <p><a href="${resetPassLink}" style="color: #3498db;">${resetPassLink}</a></p>

        <p style="margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #888;">– The FlavorQuest Team</p>
      </div>
    `
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  let userExists = await prisma.user.findUnique({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userExists) throw new ApiError(httpStatus.NOT_FOUND, "User not found!");

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");

  const password = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
