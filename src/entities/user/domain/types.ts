export type UserId = string;

export const ROLES: Record<string, string> = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export type UserEntity = {
  id: UserId;
  email: string;
  role: string;
  emailVerified?: Date | null;
  image?: string | null;
  name?: string | null;
};

export type SessionEntity = {
  user: {
    id: UserId;
    email: string;
    role: string;
    name?: string | null;
    image?: string | null;
  };
  expires: string;
};

export type Profile = {
  email: string;
  name?: string | null;
  image?: string | null;
};
