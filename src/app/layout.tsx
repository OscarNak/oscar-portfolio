import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MorphingBackground } from "@/components/MorphingBackground";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oscar - Portfolio",
  description: "Mon portfolio personnel, mettant en avant mes projets et mes passions.",
  icons: {
    icon: "/Copper_Golem.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${geistSans.className} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <MorphingBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
