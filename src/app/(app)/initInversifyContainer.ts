import "reflect-metadata";

import { Container } from "inversify";

import { CourseEntityModule } from "@/entities/course/server-index";
import { UserEntityModule } from "@/entities/user/server-index";
import { CoursesListModule } from "@/features/courses-list/server-index";
import { UpdateProfileModule } from "@/features/update-profile/server-index";
import { FileStorageModule } from "@/shared/lib/file-storage";
import { TrpcModule } from "@/shared/lib/trpc/server";

const initInversifyContainer = () => {
  const container = new Container();

  container.load(
    CoursesListModule,
    CourseEntityModule,
    UserEntityModule,
    TrpcModule,
    UpdateProfileModule,
    FileStorageModule,
  );

  return container;
};

export const initialInversify = initInversifyContainer();
