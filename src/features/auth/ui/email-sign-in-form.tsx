"use client";

import { useForm } from "react-hook-form";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

import { useEmailSignIn } from "../model/use-email-sign-in";

export const EmailSignInForm = ({ className }: { className?: string }) => {
  const emailSignIn = useEmailSignIn();
  const form = useForm<{ email: string }>({
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => emailSignIn.signIn(data.email))}
        className={cn(className, "space-y-8")}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Введите почту</FormLabel>
              <FormControl>
                <Input placeholder="email.." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={emailSignIn.signInIsLoading} type="submit">
          Войти
        </Button>
      </form>
    </Form>
  );
};
