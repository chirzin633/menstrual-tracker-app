import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Menstrual Tracker",
  description: "Track your manual menstrual cycle easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-linear-to-br from-pink-50 to-purple-50">
          {children}
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
