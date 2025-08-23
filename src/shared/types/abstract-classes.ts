import { AnyRouter } from "@trpc/server";
import { injectable } from "inversify";
import { AuthOptions, Session } from "next-auth";

import { StoredFile } from "../lib/file-storage";

import {
  CourseEntity,
  CreateUser,
  Profile,
  UpdateProfile,
  UploadBlob,
  UserEntity,
  UserId,
} from "./domain-types";

@injectable()
export abstract class CoursesRepository {
  abstract getCoursesList(): Promise<CourseEntity[]>;
}

@injectable()
export abstract class GetCoursesListService {
  abstract exec(): Promise<CourseEntity[]>;
}

@injectable()
export abstract class UserRepository {
  abstract createUser(user: UserEntity): Promise<UserEntity>;
}

@injectable()
export abstract class ProfileRepository {
  abstract update(userId: UserId, data: Partial<Profile>): Promise<Profile>;
  abstract getProfileById(id: UserId): Promise<Profile>;
  abstract uploadAvatarMethod(
    file: UploadBlob,
    tag: string,
  ): Promise<StoredFile>;
}

@injectable()
export abstract class GetProfileService {
  abstract exec(params: { userId: UserId }): Promise<Profile>;
}

@injectable()
export abstract class UpdateProfileService {
  abstract exec(params: UpdateProfile): Promise<Profile>;
  abstract uploadAvatar(file: UploadBlob, tag: string): Promise<StoredFile>;
}

@injectable()
export abstract class CreateUserService {
  abstract exec(data: CreateUser): Promise<UserEntity>;
}

@injectable()
export abstract class Controller {
  abstract router: AnyRouter;
}

@injectable()
export abstract class NextAuthConfig {
  abstract options: AuthOptions;
}

@injectable()
export abstract class SessionServer {
  abstract get(): Promise<Session | null>;
}

@injectable()
export abstract class CreateContext {
  abstract createContext(): Promise<{ session: Session | null }>;
}

@injectable()
export abstract class FileStorage {
  abstract uploadAvatar(file: UploadBlob, tag: string): Promise<StoredFile>;
  abstract upload(
    file: UploadBlob,
    bucket: string,
    tag: string,
  ): Promise<StoredFile>;
}
