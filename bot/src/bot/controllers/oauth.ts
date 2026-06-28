import { Router } from "express";
import { type Payload } from "payload";

import { oauthSchema } from "../../lib/schemas";
import { OauthService } from "../services/oauth";

export const OauthRouter = async (payloadInstance: Payload) => {
  const router = Router();
  const oauthService = new OauthService(payloadInstance);
  router.get("/authorize", async (req, res) => {
    const resultParse = oauthSchema.safeParse(req.query);
    if (!resultParse.success) {
      return res.status(400).json({ error: resultParse.error.flatten() });
    }

    const {
      response_type: _response_type,
      client_id,
      redirect_uri,
      code_challenge: _code_challenge,
      code_challenge_method: _code_challenge_method,
    } = resultParse.data;

    const oauthClient = await oauthService.findOauthClient(client_id);

    if (!oauthClient) {
      return res.status(400).json({ error: "OAuth client not found" });
    }

    const isRedirectUriAllowed = oauthClient.redirect_uris.some(
      (item) => item.uri === redirect_uri,
    );

    if (!isRedirectUriAllowed) {
      return res.status(400).json({ error: "Redirect URI is not allowed" });
    }

    const code = await oauthService.createOauthClient({
      ...resultParse.data,
      client_name: oauthClient.client_name,
      client_id: oauthClient.client_id,
    });

    res.redirect(`${process.env.TELEGRAM_BOT_URL}?start=${code}`);
  });

  return router;
};
