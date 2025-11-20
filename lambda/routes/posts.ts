import { Hono } from "hono";
import { exists, eq, desc } from "drizzle-orm";

import { AuthContext } from "../types";
import { jwtAuth } from "../middlewares/jwtAuth";
import { db } from "../db";
import { posts, users, profiles } from "../db/schema";

const postsRouter = new Hono<{ Variables: AuthContext }>();

/*
/ 投稿
*/
postsRouter.post("/post", jwtAuth, async (c) => {
  const userId = c.get("userId");
  const { content } = await c.req.json();

  if (!content) {
    return c.json({ message: "Content is required" }, 400);
  }

  try {
    // 投稿を挿入
    const insertedPost = await db
      .insert(posts)
      .values({
        content,
        authorId: userId,
      })
      .returning(); // 作成されたレコードを取得
    const post = insertedPost[0];
    const result = {
      ...post,
    };
    return c.json(result, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

/*
/ 投稿
*/
postsRouter.get("/get-latest-post", async (c) => {
  try {
    // 最新10件の投稿を取得
    const latestPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        author: users, // author情報
        profile: profiles, // authorのプロフィール
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(posts.createdAt))
      .limit(10);

    return c.json(latestPosts, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

/*
/ 閲覧しているuserの投稿内容だけを取得
*/
postsRouter.get("/:userId", async (c) => {
  const userId = Number(c.req.param("userId"));
  if (isNaN(userId)) {
    return c.json({ message: "Invalid userId" }, 400);
  }

  try {
    // 投稿 + author情報（password除外）を取得
    const userPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt));

    return c.json(userPosts, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default postsRouter;
