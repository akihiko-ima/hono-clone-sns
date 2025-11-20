import { Hono } from "hono";
import { eq } from "drizzle-orm";

import { AuthContext } from "../types";
import { jwtAuth } from "../middlewares/jwtAuth";
import { db } from "../db";
import { posts, users, profiles } from "../db/schema";

const usersRouter = new Hono<{ Variables: AuthContext }>();

/*
/ ログインしているユーザー情報の取得
*/
usersRouter.get("/me", jwtAuth, async (c) => {
  const userId = c.get("userId") as number;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return c.json({ error: "ユーザーが見つかりませんでした。" }, 404);
    }

    return c.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      200
    );
  } catch (error: any) {
    console.error(error);
    return c.json({ message: error.message }, 500);
  }
});

/*
/ 対象ユーザーのプロフィール情報の取得
*/
usersRouter.get("/profile/:userId", async (c) => {
  const userId = Number(c.req.param("userId"));
  if (isNaN(userId)) {
    return c.json({ message: "Invalid userId" }, 400);
  }

  try {
    const profileWithUser = await db
      .select({
        profileId: profiles.id,
        bio: profiles.bio,
        profileImageUrl: profiles.profileImageUrl,
        userId: profiles.userId,
        // author情報（必要なカラムだけ）
        authorId: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(profiles)
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (profileWithUser.length === 0) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json({ profile: profileWithUser[0] }, 200);
  } catch (error: any) {
    console.error(error);
    return c.json({ message: error.message || "Internal server error" }, 500);
  }
});

export default usersRouter;
