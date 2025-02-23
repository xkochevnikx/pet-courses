import Link from "next/link";

import { SignInForm } from "@/features/auth/server-index";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function SignIn() {
  return (
    <div className="container flex-col items-center justify-center self-center pt-24">
      <Card className="max-w-[350px] mx-auto flex-col gap-4">
        <CardHeader>
          <CardTitle className="text-center">Войти в аккаунт</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
        <CardFooter>
          <p className="px-0 text-center text-sm text-muted-foreground">
            Нажимая продолжить вы соглашаетесь с{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Пользовательским соглашением
            </Link>{" "}
            и{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Политикой конфиденциальности
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
