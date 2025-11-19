import { Hono } from "hono";

import auth from "./routes/auth";
import posts from "./routes/posts";
import users from "./routes/users";

const app = new Hono();

app.route("/api/auth", auth);
app.route("/api/posts", posts);
app.route("/api/users", users);

export default app;
