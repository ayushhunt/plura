import { handle } from "hono/vercel";
import { Context, Hono, Next } from "hono";
import mail from "./mail";
import test from "./test";
import session from "./session";
import auth from "./auth";
import status from "./status";
import health from "./health";
import user from "./user";
import project from "./project";
import contributors from "./contributors";
import feedback from "./feedback";
import { cors } from "hono/cors";
import workspace from "./workspace";
import { Ratelimit } from "@upstash/ratelimit";
import { auth as Auth } from "@plura/auth";
import { cache } from "@plura/cache";
import workflow from "./workflow";
import adminclient from "./adminclient";

export const runtime = "edge";

const app = new Hono().basePath("/v1");

const allowedOrigins = [
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "https://www.plura.pro",
  "https://app.plura.pro",
  "https://status.plura.pro",
];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

const rateLimitHandler = async (c: Context, next: Next) => {
  const session = await Auth.api.getSession({ headers: c.req.raw.headers });

  // const limit = process.env.NODE_ENV === "production" ? 60 : 5; // for testing
  const limit = process.env.NODE_ENV === "production" ? 60 : 100;

  const rateLimit = new Ratelimit({
    redis: cache,
    limiter: Ratelimit.slidingWindow(limit, "1m"),
    analytics: true, // store analytics data in redis db
  });

  const { success } = await rateLimit.limit(
    session?.session.ipAddress || session?.session.userId || "anonymous",
  );

  if (!success) {
    return c.json({ message: "You hit the rate limit" }, 429);
  }
  return await next();
};

app.route("/health", health);
app.route("/status", status);

app.use(rateLimitHandler);
// apply rate limit to below routes
app.route("/session", session);
app.route("/test", test);
app.route("/mail", mail);
app.route("/auth", auth);
app.route("/user", user);
app.route("/contributors", contributors);
app.route("/workspace", workspace);
app.route("/project", project);
app.route("/feedback", feedback);
app.route("/workflow", workflow);
app.route("/adminclient", adminclient);

const GET = handle(app);
const POST = handle(app);
const PATCH = handle(app);
const DELETE = handle(app);
const OPTIONS = handle(app);

export { GET, PATCH, POST, DELETE, OPTIONS };
