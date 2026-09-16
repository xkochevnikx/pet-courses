"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { ReactNode } from "react";

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
};
