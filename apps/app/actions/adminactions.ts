"use server";

import { betterFetch } from "@better-fetch/fetch";
import { getSession } from "./session";
import { headers } from "next/headers";

const API_ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://api.plura.pro/"
    : "http://localhost:3001";

export const fetchUserList = async () => {
  const user = await getSession();
  if (!user) {
    return;
  }
  const list = await betterFetch(`${API_ENDPOINT}/v1/adminclient/usersList`, {
    method: "GET",
    headers: {
      cookie: (await headers()).get("cookie") || "",
    },
  });

  return list;
};
