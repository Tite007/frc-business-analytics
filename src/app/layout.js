import "./globals.css";
import Navbar from "@/components/navbar/InteractiveNavbar";
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
      <body className="lg:container mx-auto min-h-screen bg-gray-50 ">
        <HeroUIProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {/* Mobile-first responsive container */}
              <div className="w-full mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10 xl:px-16 xl:py-12 2xl:px-20 2xl:py-16 max-w-none sm:max-w-none md:max-w-none lg:max-w-7xl xl:max-w-7xl 2xl:max-w-8xl">
                {children}
              </div>
            </main>
          </div>
        </HeroUIProvider>
      </body>
    </html>
  );
}
