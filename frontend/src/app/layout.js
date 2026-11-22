import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { UserProvider } from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "TicketShows",
  description: "Book tickets for live events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={jakarta.variable}>
      <body className="min-h-screen flex flex-col">
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
