import { Hono } from "hono";

const users = new Hono();

users.get("/", (c) => c.text("this is users endpoint"));

export default users;
