import { injectable } from "inversify";
import { getServerSession } from "next-auth";

import { NextAuthConfig, SessionServer } from "@/shared/types/abstract-classes";

@injectable()
export class SessionServerImp extends SessionServer {
  constructor(private NextAuthConfig: NextAuthConfig) {
    super();
  }

  get() {
    return getServerSession(this.NextAuthConfig.options);
  }
}
