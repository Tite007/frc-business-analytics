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
      <body className="lg:container mx-auto min-h-screen  ">
        <AuthProvider>
          <HeroUIProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {/* Mobile-first responsive container */}
                <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-none sm:max-w-none md:max-w-none lg:max-w-7xl xl:max-w-7xl 2xl:max-w-8xl">
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
