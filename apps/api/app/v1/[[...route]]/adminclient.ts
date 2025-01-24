import { authClient } from "@/app/utils/auth-client";
import { auth } from "@plura/auth";
import { Hono } from "hono";


const app = new Hono().get("/usersList",async (c)=>{
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    if (!session) {
        return c.json({ message: "Unauthorized", status: 401 }, 401);
    }
    console.log(session)
    const users = await authClient.admin.listUsers({
        query: {
            limit: 1,
        }
    });
    return c.json({
        users
    })
})

export default app;