import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email: string;
      image?: string;
    };
  }
  interface User {
    id: string;
    email: string;
    image?: string;
    name?: string;
  }
}
