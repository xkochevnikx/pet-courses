// get-profile-letters.test.ts

import { getProfileLetters } from "./get-profile-letters";

import type { Profile } from "../domain/types";

// Мок для профиля
const makeProfile = (partial: Partial<Profile>): Profile => ({
  name: undefined,
  email: "",
  ...partial,
});

describe("getProfileLetters", () => {
  it("возвращает инициалы из имени (два слова)", () => {
    const profile = makeProfile({ name: "Alice Cooper" });
    expect(getProfileLetters(profile)).toBe("AC");
  });

  it("возвращает инициалы из имени (одно слово)", () => {
    const profile = makeProfile({ name: "Masha" });
    expect(getProfileLetters(profile)).toBe("MA");
  });

  it("возвращает инициалы из email с точкой", () => {
    const profile = makeProfile({ email: "john.doe@example.com" });
    expect(getProfileLetters(profile)).toBe("JD");
  });

  it("возвращает инициалы из email с подчёркиванием", () => {
    const profile = makeProfile({ email: "ivan_petrov@example.com" });
    expect(getProfileLetters(profile)).toBe("IP");
  });

  it("возвращает инициалы из email с дефисом", () => {
    const profile = makeProfile({ email: "anna-smith@example.com" });
    expect(getProfileLetters(profile)).toBe("AS");
  });

  it("возвращает инициалы из email без разделителей", () => {
    const profile = makeProfile({ email: "sasha@example.com" });
    expect(getProfileLetters(profile)).toBe("SA");
  });

  it("корректно работает с кириллицей", () => {
    const profile = makeProfile({ name: "олег петров" });
    expect(getProfileLetters(profile)).toBe("ОП");
  });

  it("should work with short names", () => {
    const res = getProfileLetters({
      email: "admin@gmail.com",
      name: "E",
    });

    expect(res).toEqual("E");
  });
});
