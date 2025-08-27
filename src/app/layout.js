import "./globals.css";
import Navbar from "@/components/navbar/InteractiveNavbar";
import { NextUIProvider } from "@nextui-org/system";

export const metadata = {
  title: "FRC Business Analytics",
  description: "Company profile dashboards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NextUIProvider>
          <Navbar />
          <main>{children}</main>
        </NextUIProvider>
      </body>
    </html>
  );
}
