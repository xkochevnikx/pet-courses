import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { courseListController } from "@/features/courses-list/server-index";
import { createContext, mergeRouters } from "@/kernel/lib/trpc/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "api/trpc",
    req,
    router: mergeRouters(courseListController),
    createContext: createContext,
  });

export { handler as GET, handler as POST };
