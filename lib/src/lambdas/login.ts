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
app.post("/auth/login", async (c) => {
  console.log("REQUEST", c.req);
  const allCookies = getCookie(c);
  console.log("ALL COOKIES", allCookies);
  const { email, password } = await c.req.json();
  console.log(email, password);

  const user = await auth.api.signInEmail({
    body: {
      email: email as string,
      password: password as string,
    },
  });
  console.log(user);
  return c.json({
    message: "Login successful",
  });
});

// this is so it better-auth is available for other routes above
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export const handler = handle(app);
