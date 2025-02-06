"use client";
import { useState, useTransition } from "react";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { CourseListElement } from "../model/types";

export const CourseItem = ({
  course,
  onDelete,
}: {
  course: CourseListElement;
  onDelete: () => Promise<void>;
}) => {
  const [isLoadingDelete, startDeleteTransition] = useTransition();
  const [_, setError] = useState<Error | null>(null); // Добавили стейт ошибки

  const handleBugClick = () => {
    try {
      throw new Error("test error");
    } catch (error) {
      setError(() => {
        throw error; // Перебрасываем ошибку в ErrorBoundary
      });
    }
  };
  const handleDelete = () => {
    startDeleteTransition(async () => {
      await onDelete();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-1">
        <Button disabled={isLoadingDelete} onClick={handleDelete}>
          Удалить
        </Button>
        <Button onClick={handleBugClick}>bug button</Button>
      </CardFooter>
    </Card>
  );
};
