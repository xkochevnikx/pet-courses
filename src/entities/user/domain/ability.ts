import { ROLES, SessionEntity, UserId } from "@/kernel/domain/types";

export const createUserAbility = (session: SessionEntity) => ({
  canGetUser: (id: UserId) => {
    return session?.user.id === id || session?.user.role === ROLES.ADMIN;
  },
});

export const createProfileAbility = (session: SessionEntity | null) => ({
  canUpdateProfile: (id: UserId) => {
    return session?.user.id === id || session?.user.role === ROLES.ADMIN;
  },
});
