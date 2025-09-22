/* eslint-disable @typescript-eslint/no-explicit-any */
import httpClient from './httpClient';

export const login = async (credentials: any) => {
  const response = await httpClient.post("/auth/login", credentials);
  return response.data;
};

export const signup = async (userInfo: any) => {
  const response = await httpClient.post("/auth/register", userInfo);
  return response.data;
};
