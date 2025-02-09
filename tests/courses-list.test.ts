import { expect, test } from "@playwright/test";

test("test", async ({ page }) => {
  console.log("Navigating to:", process.env.TEST_ENV_BASE_URL);

  await page.goto("/");
  await page.waitForLoadState("load"); // ✅ Гарантирует, что DOM загружен
  await page.getByRole("textbox", { name: "name" }).click();
  await page.getByRole("textbox", { name: "name" }).fill("svyat");
  await page.getByRole("textbox", { name: "name" }).press("Tab");
  await page
    .getByRole("textbox", { name: "description" })
    .fill("frontend engineer");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(page.getByText("svyat")).not.toBeVisible();
});
