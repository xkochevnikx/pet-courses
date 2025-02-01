import { expect, test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.waitForLoadState("networkidle");

  await page.getByRole("textbox", { name: "name" }).click();
  await page.getByRole("textbox", { name: "name" }).fill("svyat");
  await page.getByRole("textbox", { name: "description" }).click();
  await page
    .getByRole("textbox", { name: "description" })
    .fill("frontend engineer");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByText("svyatfrontend engineerУдалить").click();
  await page
    .locator("div")
    .filter({ hasText: /^svyatfrontend engineerУдалить$/ })
    .getByRole("button")
    .click();
  await expect(
    page.getByText("svyatfrontend engineerУдалить"),
  ).not.toBeVisible();
});
