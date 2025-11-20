import { Hono } from "hono";

import authRouter from "./routes/auth";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";

const app = new Hono();

app.route("/api/auth", authRouter);
app.route("/api/posts", postsRouter);
app.route("/api/users", usersRouter);

export default app;
