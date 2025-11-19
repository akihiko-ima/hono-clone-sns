import { Hono } from "hono";

const posts = new Hono();

posts.get("/", (c) => c.text("this is posts endpoint"));

export default posts;
