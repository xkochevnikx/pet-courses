import { ThemeSwitcher } from "@/features/theme-switcher";

import { Layout } from "./layout";
import { Logo } from "./logo";
import { Nav } from "./nav";
import { Profile } from "./profile";

export const Header = ({
  variant,
}: {
  variant: "auth" | "private" | "public";
}) => {
  const isProfile = variant !== "auth";
  return (
    <Layout
      logo={<Logo />}
      nav={<Nav />}
      actions={<ThemeSwitcher />}
      profile={isProfile && <Profile />}
    />
  );
};
