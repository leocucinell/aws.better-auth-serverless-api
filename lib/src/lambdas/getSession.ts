import { Hono } from "hono";
import type { LambdaEvent, LambdaContext } from "hono/aws-lambda";
import { handle } from "hono/aws-lambda";
import { logger } from "hono/logger";
import { getCookie } from "hono/cookie";
import { auth } from "../../../utils/auth";

type Bindings = {
  event: LambdaEvent;
  lambdaContext: LambdaContext;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use(logger());

// TODO: add body validation with zod
app.get("/auth/session", async (c) => {
  console.log("REQUEST", c.req);
  const allCookies = getCookie(c);
  console.log("ALL COOKIES", allCookies);
  console.log("HEADER", c.req.header());

  const session = await auth.api.getSession({
    headers: new Headers(c.req.raw.headers),
  });
  console.log("SESSION", session);

  return c.json({
    message: "Check Logs for Session",
  });
});

// this is so it better-auth is available for other routes above
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export const handler = handle(app);
