export type Profile = {
  email: string;
  name?: string | null;
  image?: string | null;
};

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

export type CourseEntity = {
  id: string;
  title: string;
  description: string;
  slug: string;
};

export type CreateUser = {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};

export type UpdateProfile = {
  userId: UserId;
  data: Partial<Profile>;
};

export type UploadBlob = {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  bytes: Uint8Array;
};
