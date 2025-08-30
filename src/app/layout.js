import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import ConditionalNavbar from "@/components/navbar/ConditionalNavbar";
import ConditionalMain from "@/components/ConditionalMain";
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
              <ConditionalNavbar />
              <ConditionalMain>{children}</ConditionalMain>
            </div>
          </HeroUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
