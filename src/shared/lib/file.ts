/**
 * Открывает диалог выбора одного файла.
 * @param contentType MIME-тип, например "image/*", "application/pdf" и т.п.
 * @returns Выбранный файл или null, если пользователь отменил выбор.
 */
export const selectFile = (contentType: string): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = contentType;

    input.onchange = () => {
      const file = input.files?.[0];
      resolve(file ?? null);
    };

    input.click();
  });
};
export const validateFileSize = (file: File, sizeMb: number) => {
  const fileSize = file.size / 1024 / 1024;
  if (fileSize > sizeMb) {
    return false;
  } else {
    return true;
  }
};
