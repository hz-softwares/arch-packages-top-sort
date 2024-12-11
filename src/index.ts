import { Elysia } from "elysia";
import { dependencyResolver } from "./controllers/dependencyResolver";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .onError(({ set, code, error, ...rest }) => {
    console.log("err", error, rest);
    return new Response(error.toString(), { status: 500 });
  })
  .use(cors())
  .use(dependencyResolver)
  .listen(process.env.PORT ?? 8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
