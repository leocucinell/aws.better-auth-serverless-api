import { Hono } from "hono";
import type { LambdaEvent, LambdaContext } from "hono/aws-lambda";
import { handle } from "hono/aws-lambda";
import { logger } from "hono/logger";
import { auth } from "../../../utils/auth";

type Bindings = {
  event: LambdaEvent;
  lambdaContext: LambdaContext;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use(logger());

// app.post("/*", (c) => {
//   console.log("HELLO WORLD");
//   return c.json({
//     isBase64Encoded: c.env.event.isBase64Encoded,
//     awsRequestId: c.env.lambdaContext.awsRequestId,
//   });
// });

// TODO: add body validation with zod
app.post("/auth/signup", async (c) => {
  const { email, password, name } = await c.req.json();
  console.log(email, password, name);
  const user = await auth.api.signUpEmail({
    body: {
      email: email as string,
      password: password as string,
      name: name as string,
    },
  });
  console.log(user);
  return c.json({
    message: "Signup successful",
  });
});

// this is so it better-auth is available for other routes above
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export const handler = handle(app);
