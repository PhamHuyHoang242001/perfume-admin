import React from "react";
import { AppShell } from "@mantine/core";
import HeaderMenu from "./HeaderMenu.tsx";
type LayoutProps = {
  children: React.ReactNode;
};
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AppShell padding={"md"} header={<HeaderMenu />}>
      {children}
    </AppShell>
  );
};

export default Layout;
