"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Profile, UserId } from "@/entities/user";
import { getDefaultValues } from "@/features/update-profile/model/domain";
import { profileFormSchema } from "@/features/update-profile/model/schema";
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
import { Spinner } from "@/shared/ui/spinner";

import { useUpdateProfile } from "../view-model/use-update-profile";

import { AvatarField } from "./avatar-field";

export const UpdateForm = ({
  userId,
  profile,
  onSuccess,
  submitText = "Сохранить",
}: {
  userId: UserId;
  profile: Profile;
  onSuccess: () => void;
  submitText: string;
}) => {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getDefaultValues(profile),
  });

  const updateProfile = useUpdateProfile();

  const handleSubmit = form.handleSubmit(async (data) => {
    const updatedProfile = await updateProfile.update({
      userId,
      data,
    });

    if (updatedProfile?.profile) {
      form.reset(getDefaultValues(updatedProfile?.profile));
      onSuccess?.();
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваша почта</FormLabel>
              <FormControl>
                <Input
                  placeholder="email.."
                  type="email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="name.." type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Аватар</FormLabel>
              <FormControl>
                <AvatarField
                  onChange={field.onChange}
                  value={field.value}
                  onError={() => {}}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="min-w-full">
          {updateProfile.isLoading && (
            <Spinner className="mr-2 h-4 w-4 " aria-label="Загрузка выхода" />
          )}
          {submitText}
        </Button>
      </form>
    </Form>
  );
};
