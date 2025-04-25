import "./globals.css";
import { geistMono, geistSans } from "@/lib/fonts";
import { Provider } from "@/utils/Provider";

export default function RootLayout({
  children,

}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
