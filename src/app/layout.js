import "./globals.css";
import Navbar from "@/components/navbar/InteractiveNavbar";

export const metadata = {
  title: "FRC Business Analytics",
  description: "Company profile dashboards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
