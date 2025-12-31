import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "GitHub Stats 2025 | Username-Based GitHub Analytics",
  description: "Check GitHub 2025 statistics in seconds. Enter any GitHub username and explore yearly coding activity and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
