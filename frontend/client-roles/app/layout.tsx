import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";

const inter = localFont({
  src: [
    { path: "../public/fonts/83afe278b6a6bb3c-s.p.3a6ba036.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Site Supervise",
  description:
    "Manage, monitor, and analyze every construction project from one platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: "13px",
                borderRadius: "10px",
                padding: "12px 16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
