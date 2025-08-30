"use client";

import { usePathname } from "next/navigation";
import AuthNavbar from "./AuthNavbar";

const ConditionalNavbar = () => {
  const pathname = usePathname();

  // Hide navbar for CMS pages
  if (pathname.startsWith("/cms")) {
    return null;
  }

  return <AuthNavbar />;
};

export default ConditionalNavbar;
