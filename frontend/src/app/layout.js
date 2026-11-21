import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "TicketShows",
  description: "Book tickets for live events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className="bg-white text-neutral-900 min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
