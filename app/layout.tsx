import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Tonight's bar",
  description: "Pick a drink, add your name, send.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f1420",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* browser extensions (e.g. ColorZilla) add attributes to <body>; ignore those diffs */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}