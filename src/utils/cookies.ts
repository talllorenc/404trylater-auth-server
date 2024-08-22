import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";

export const REFRESH_PATH = "/auth/refresh";
const secure = NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure,
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: REFRESH_PATH,
});

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: REFRESH_PATH });
