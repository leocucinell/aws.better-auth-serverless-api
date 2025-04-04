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

app.use("*", async (c, next) => {
  console.log("HELLO WORLD FROM MIDDLEWARE");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user" as never, null);
    c.set("session" as never, null);
    return next();
  }

  c.set("user" as never, session.user);
  c.set("session" as never, session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  console.log("HELLO WORLD FROM FUNCTION");
  return auth.handler(c.req.raw);
});

export const handler = handle(app);
