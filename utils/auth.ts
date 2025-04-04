import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../lib/src/db/";
import * as schema from "../lib/src/db/schemas/auth-schema";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
  //   advanced: {
  //     cookies: {
  //       sessionToken: {
  //         attributes: {
  //           sameSite: "none",
  //           secure: true,
  //           partitioned: true, // New browser standards will mandate this for foreign cookies
  //         },
  //       },
  //     },
  //   },
});
