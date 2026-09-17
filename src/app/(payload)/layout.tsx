/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";

/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from "@payload-config";

import "@payloadcms/next/css";

import { importMap } from "./admin-cms/importMap.js";

import type { ServerFunctionClient } from "payload";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
