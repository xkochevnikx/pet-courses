import { Router } from "express";
import payload from "payload";

export const OauthRouter = async (payloadInstance: typeof payload) => {
  const router = Router();

  router.get("/test", async (req, res) => {
    res.send("Hello World from oauth test");
  });

  return router;
};
