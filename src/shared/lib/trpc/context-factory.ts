import { injectable } from "inversify";

import { CreateContext, SessionServer } from "@/shared/types/abstract-classes";

@injectable()
export class CreateContextImp extends CreateContext {
  constructor(private getServerSession: SessionServer) {
    super();
  }
  createContext = async () => {
    const session = await this.getServerSession.get();
    return {
      session,
    };
  };
}
