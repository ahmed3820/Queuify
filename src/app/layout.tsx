import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Box } from "@mui/material";
import TopAppBar from "@/components/TopAppBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Queuing Theory Calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopAppBar />
          {children}
        </Box>
      </body>
    </html>
  );
}
