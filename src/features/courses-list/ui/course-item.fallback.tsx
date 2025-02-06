import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export const CourseItemFallback = (error: Error, resetError: () => void) => {
  return (
    <Card className="m-4 bg-red-100 border border-red-400 rounded">
      <CardHeader>
        <CardTitle className="text-red-600 text-lg font-bold">
          Произошла ошибка!
        </CardTitle>
        <CardDescription className="text-red-500">
          {error.message}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={resetError} className="mt-2">
          Попробовать снова
        </Button>
      </CardFooter>
    </Card>
  );
};
