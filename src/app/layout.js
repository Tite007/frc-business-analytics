import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/navbar/AuthNavbar";
import { HeroUIProvider } from "@heroui/system";

export const metadata = {
  title: "FRC Business Analytics",
  description: "Company profile dashboards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <HeroUIProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {/* Full-width mobile, contained on larger screens */}
                <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 max-w-none lg:max-w-7xl xl:max-w-7xl 2xl:max-w-8xl">
                  {children}
                </div>
              </main>
            </div>
          </HeroUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
