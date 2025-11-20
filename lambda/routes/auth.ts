import { Hono } from "hono";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { exists, eq } from "drizzle-orm";

import { db } from "../db";
import { users, profiles } from "../db/schema";
import generateIdenticon from "../utils/generateIdenticon";

const authRouter = new Hono();

export const checkEmailExists = async (email: string) => {
  const subQuery = db.select().from(users).where(eq(users.email, email));

  const result = await db
    .select({ exists: exists(subQuery) })
    .from(users)
    .limit(1);

  return result[0]?.exists ?? false;
};

/*
/ ユーザー登録
*/
authRouter.post("/register", async (c) => {
  const { username, email, password } = await c.req.json();

  if (!username || !email || !password) {
    return c.json({ error: "username, email, password required" }, 400);
  }

  const defaultIconImage = generateIdenticon(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // すでに登録済みか確認
    const existing = await checkEmailExists(email);

    if (existing) {
      return c.json({ error: "email already in use" }, 400);
    }

    // User 作成
    const insertedUser = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    const user = insertedUser[0];

    // Profile 作成
    const insertedProfile = await db
      .insert(profiles)
      .values({
        userId: user.id,
        bio: "はじめまして",
        profileImageUrl: defaultIconImage,
      })
      .returning();

    const profile = insertedProfile[0];

    return c.json(
      {
        user: {
          ...user,
          profile,
        },
      },
      201
    );
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

/*
/ ログイン
*/
authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "email, password required" }, 400);
  }

  // 1. Email からユーザーを取得
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  // 2. パスワードチェック
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return c.json({ message: "Invalid password" }, 401);
  }

  // 3. JWT 作成
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET_KEY || "dummy_secret",
    {
      expiresIn: "10m",
      algorithm: "HS256",
    }
  );

  return c.json({ token });
});

export default authRouter;
