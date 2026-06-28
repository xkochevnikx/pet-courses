import { randomUUID } from "node:crypto";

import { Payload } from "payload";

import type { OauthClient, OauthCodeClient } from "payload/generated-types";

type CreateOauthClientData = Omit<
  OauthCodeClient,
  "id" | "code" | "updatedAt" | "createdAt" | "status" | "expires_at"
>;

const SESSION_TTL_MS = 15 * 60 * 1000;

export class OauthService {
  constructor(private payloadInstance: Payload) {
    this.payloadInstance = payloadInstance;
  }

  async findOauthClient(client_id: string) {
    const { docs } = await this.payloadInstance.find({
      collection: "oauthClients",
      where: {
        client_id: {
          equals: client_id,
        },
      },
      limit: 1,
    });

    return docs[0] as unknown as OauthClient;
  }

  async createOauthClient(data: CreateOauthClientData) {
    const code = randomUUID().replace(/-/g, "").slice(0, 32);
    await this.payloadInstance.create({
      collection: "oauthCodeClient",
      data: {
        ...data,
        code,
        status: "pending",
        expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      },
    });
    return code;
  }

  async getOauthClientByCode(code: string): Promise<OauthCodeClient | null> {
    const doc = await this.payloadInstance
      .find({
        collection: "oauthCodeClient",
        where: { code: { equals: code } },
        limit: 1,
        pagination: false,
      })
      .then((res) => res.docs[0]);

    if (!doc) return null;

    const client = doc as unknown as OauthCodeClient;

    if (new Date(client.expires_at) < new Date()) {
      await this.payloadInstance.delete({
        collection: "oauthCodeClient",
        id: client.id,
      });

      return null;
    }

    return client;
  }

  async updateOauthCodeClient({ code, user }) {
    const session = await this.getOauthClientByCode(code);

    if (!session || session.status !== "pending") return null;

    await this.payloadInstance.update({
      collection: "oauthCodeClient",
      id: session.id,
      data: {
        user: JSON.stringify(user),
        status: "confirmed",
      },
    });

    return await this.getOauthClientByCode(code);
  }
}
