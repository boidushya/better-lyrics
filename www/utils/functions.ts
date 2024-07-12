import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TStatus = "operational" | "degraded" | "downtime";

export async function getApiStatus() {
  const token = process.env.BETTERSTACK_KEY;

  if (!token) {
    throw new Error("No BetterStack key provided");
  }

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch("https://uptime.betterstack.com/api/v2/status-pages/189479", options);
  const { data } = await response.json();

  const status = data.attributes.aggregate_state as TStatus;

  return status;
}
