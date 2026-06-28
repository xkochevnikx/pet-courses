import { CollectionConfig } from "payload/types";

export const OauthClients: CollectionConfig = {
  slug: "oauthClients",
  admin: {
    useAsTitle: "client_email",
  },
  fields: [
    { name: "client_name", type: "text", required: true },
    { name: "client_id", type: "text", required: true },
    {
      name: "client_secret",
      type: "text",
      required: true,
      admin: { readOnly: true },
      defaultValue: () => window.crypto.randomUUID(),
    },

    {
      required: true,
      name: "redirect_uris",
      type: "array",
      defaultValue: [],
      fields: [{ name: "uri", type: "text", required: true }],
    },
  ],
};
