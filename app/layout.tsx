import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "קוראים יחד",
  description: "אפליקציה ללימוד קריאה בעברית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
