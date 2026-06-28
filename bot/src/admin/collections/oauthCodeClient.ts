import { CollectionConfig } from "payload/types";

export const OauthCodeClient: CollectionConfig = {
  slug: "oauthCodeClient",
  admin: {
    useAsTitle: "code",
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
      ],
      defaultValue: "pending",
    },
    {
      name: "expires_at",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    { name: "user", type: "text", admin: { readOnly: true } },
    { name: "redirect_uri", type: "text", admin: { readOnly: true } },
    { name: "client_id", type: "text", admin: { readOnly: true } },
    { name: "client_name", type: "text", admin: { readOnly: true } },
    { name: "code_challenge", type: "text", admin: { readOnly: true } },
    { name: "code_challenge_method", type: "text", admin: { readOnly: true } },
    { name: "state", type: "text", admin: { readOnly: true } },
  ],
};
