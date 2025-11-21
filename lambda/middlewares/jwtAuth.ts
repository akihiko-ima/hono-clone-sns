import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

export const jwtAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("X-JWT-Authorization");
  if (!authHeader) {
    return c.json({ error: "No token provided" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) return c.json({ message: "権限がありません。" }, 401);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "dummy_secret"
    ) as { id: number };
    // Context に id をセット
    c.set("userId", decoded.id);
    return await next();
  } catch {
    return c.json({ message: "権限がありません。" }, 401);
  }
};
