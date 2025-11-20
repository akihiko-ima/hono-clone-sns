import { Hono } from "hono";

const usersRouter = new Hono();

usersRouter.get("/", (c) => c.text("this is users endpoint"));

export default usersRouter;
