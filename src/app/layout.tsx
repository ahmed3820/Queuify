import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Box } from "@mui/material";
import TopAppBar from "@/components/base/TopAppBar";
import { ThemeProvider } from "@/components/base/theme-provider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import MuiThemeProvider from "@/components/base/MuiThemeProvider";
import { DD1KProvider } from "@/contexts/DD1KContext";
import { MMProvider } from "@/contexts/MMContext";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Queuify - Queuing Theory Calculator and Simulator",
  description:
    "Queuify is an interactive and easy-to-use queuing theory calculator and simulator. Perform M/M/S/K and D/D/1/K queue analyses with precision and real-time visualizations.",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  keywords: [
    "Queuify",
    "queuing theory",
    "queuing calculator",
    "queue simulator",
    "M/M/S/K queue",
    "M/M/1 queue",
    "M/M/1/K queue",
    "M/M/C queue",
    "M/M/C/K queue",
    "D/D/1/K queue",
    "D/D/1/K-1 queue",
    "queuing analysis",
  ],
  authors: [{ name: "Ahmed Hosny", url: "https://github.com/ahmedhosnypro" }],
  openGraph: {
    title: "Queuify - Queuing Theory Calculator and Simulator",
    description:
      "Perform precise calculations and simulations for queuing models such as M/M/1 and D/D/1/K. Experience an intuitive interface with real-time results.",
    url: "https://azsce.github.io/Queuify",
    siteName: "Queuify",
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 1200,
        height: 630,
        alt: "Queuify - Queuing Theory Calculator and Simulator",
      },
    ],
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Queuify",
      url: "https://azsce.github.io/Queuify",
      description:
        "An interactive calculator and simulator for queuing theory models like M/M/1 and D/D/1/K.",
      applicationCategory: "Calculator",
      operatingSystem: "Web",
      author: {
        "@type": "Person",
        name: "Ahmed Hosny",
        url: "https://github.com/ahmedhosnypro",
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.style.fontFamily} ${geistMono.style.fontFamily} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="theme-mode"
        >
          <AppRouterCacheProvider>
            <MuiThemeProvider defaultMode="dark">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <TopAppBar />
                <MMProvider>
                  <DD1KProvider>{children}</DD1KProvider>
                </MMProvider>
              </Box>
            </MuiThemeProvider>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
      {/* Google Analytics using next/script for better script handling */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-D4KKXZ1SH9`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D4KKXZ1SH9');
          `,
        }}
      />
      <GoogleAnalytics gaId="G-D4KKXZ1SH9" />
    </html>
  );
}
