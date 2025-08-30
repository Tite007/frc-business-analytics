"use client";

import { usePathname } from "next/navigation";

const ConditionalMain = ({ children }) => {
  const pathname = usePathname();

  // For CMS pages, render children directly without extra containers
  if (pathname.startsWith("/cms")) {
    return <>{children}</>;
  }

  // For regular pages, use the standard layout with containers
  return (
    <main className="flex-1">
      {/* Full-width mobile, contained on larger screens */}
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 max-w-none lg:max-w-7xl xl:max-w-7xl 2xl:max-w-8xl">
        {children}
      </div>
    </main>
  );
};

export default ConditionalMain;
