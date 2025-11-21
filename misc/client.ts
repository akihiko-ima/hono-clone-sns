import dotenv from "dotenv";
dotenv.config();
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import fetch from "node-fetch";

/**
 * Lambda URL に署名付きリクエストを送信する
 */
export async function lambdaFetch(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, any>,
  options?: {
    baseUrl?: string;
    jwtKey?: string;
  }
) {
  const baseUrl = options?.baseUrl || process.env.LAMBDA_URL!;
  const { hostname } = new URL(baseUrl);

  // SignatureV4 インスタンスを関数内で作る
  const signer = new SignatureV4({
    service: "lambda",
    region: process.env.AWS_REGION || "ap-northeast-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    sha256: Sha256,
  });

  if (!path.startsWith("/")) path = "/" + path;
  const requestBody =
    method === "POST" && body ? JSON.stringify(body) : undefined;

  const signed = await signer.sign({
    method,
    protocol: "https:",
    hostname,
    path,
    headers: {
      host: hostname,
      ...(requestBody ? { "content-type": "application/json" } : {}),
    },
    ...(requestBody ? { body: requestBody } : {}),
  });

  const headers: Record<string, string> = {
    ...signed.headers,
    ...(options?.jwtKey
      ? { "X-JWT-Authorization": `Bearer ${options.jwtKey}` }
      : {}),
  };

  console.log("headers:", headers);
  console.log("Request body:", requestBody);
  console.log("Final fetch URL:", baseUrl + path);

  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: requestBody,
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: res.status,
    statusText: res.statusText,
    data,
  };
}

// 使い方例
(async () => {
  try {
    /**
     * GET 例
     */
    const res = await lambdaFetch("/api/posts/get-latest-post", "GET");
    console.log(res);
    const res_2 = await lambdaFetch("/api/users/profile/2", "GET");
    console.log(res_2);
    /**
     * POST 例
     */
    const res3 = await lambdaFetch("/api/auth/register", "POST", {
      username: "test-user2",
      email: "test-user2@test.com",
      password: "password",
    });
    console.log(res3);
    const res4 = await lambdaFetch("/api/auth/login", "POST", {
      email: "test-user1@test.com",
      password: "password",
    });
    console.log(res4);
    /**
     * JWT 例
     */
    const jwtToken = "{api-endpoint-jwt-token}";
    const res5 = await lambdaFetch("/api/users/me", "GET", undefined, {
      jwtKey: jwtToken,
    });
    console.log(res5);
    const res6 = await lambdaFetch(
      "/api/posts/post",
      "POST",
      {
        content: "test-message",
      },
      {
        jwtKey: jwtToken,
      }
    );
    console.log(res6);
  } catch (err) {
    console.error(err);
  }
})();
