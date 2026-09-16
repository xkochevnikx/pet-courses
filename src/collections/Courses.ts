import type { CollectionConfig } from "payload";

export const Courses: CollectionConfig = {
  slug: "courses",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: {
    read: () => true, // публичное чтение; запись — только залогиненные в админке
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "description",
      type: "text",
      required: true,
    },
    {
      name: "image",
      type: "text",
      required: false,
    },
    // позже: description, image → relationTo: "media", lessons, ...
  ],
};
