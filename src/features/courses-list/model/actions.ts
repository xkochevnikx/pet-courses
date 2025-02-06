"use server";
import { revalidatePath } from "next/cache";

import { coursesRepository } from "../courses.repository";

import { CreateCourseListElementCommand } from "./types";

export const createCourseAction = async ({
  revalidatePagePath,
  command,
}: {
  revalidatePagePath: string;
  command: CreateCourseListElementCommand;
}) => {
  await coursesRepository.createCorseElement(command);
  revalidatePath(revalidatePagePath);
};

export const handleDeleteAction = async ({
  courseId,
  revalidatePagePath,
}: {
  courseId: string;
  revalidatePagePath: string;
}) => {
  await coursesRepository.deleteCourseElement({ id: courseId });
  revalidatePath(revalidatePagePath);
};
