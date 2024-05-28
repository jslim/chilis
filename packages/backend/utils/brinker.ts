import { logger } from "@/libs/powertools";
import { getSecret } from "@/utils/secrets";

async function fetchFromAPI(endpoint: string, body: any) {
  const { apiUrl, token } = await getSecret(process.env.BRINKER_ACCESS!);
  if (!apiUrl || !token) {
    logger.error("Secrets not properly configured");
    throw new Error("Configuration error");
  }

  const apiFetch = await fetch(`${apiUrl}/guest/loyalty/v1${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!apiFetch.ok) {
    logger.error("API request failed", { status: apiFetch.status, statusText: apiFetch.statusText });
    throw new Error("API request failed");
  }

  return apiFetch.json();
}

export async function brinkerLogin(phone: string, password: string) {
  const apiJSON = await fetchFromAPI("/weblogin", { phone, password });
  if (apiJSON.errorCode === "00000001") {
    return { loyaltyID: apiJSON.loyaltyID.toString(), points: apiJSON.points.toString() };
  } else {
    logger.error("Login error from API", { errorCode: apiJSON.errorCode, errorMessage: apiJSON.errorMessage });
    throw new Error("Login failed");
  }
}

export async function brinkerCheckStatus(loyaltyID: string) {
  const apiJSON = await fetchFromAPI("/getStatus", { loyaltyID });

  return {
    code: apiJSON.errorCode,
    points: apiJSON.errorCode === "00000001" ? apiJSON.points.toString() : "0",
  };
}
