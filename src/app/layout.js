import "./globals.css";

export const metadata = {
  title: "FRC Business Analytics",
  description: "Company profile dashboards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
