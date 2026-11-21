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
      <body className="bg-mesh min-h-screen flex flex-col text-slate-800 relative overflow-x-hidden">
        <div className="blob w-72 h-72 bg-fuchsia-400 -top-10 -left-16" />
        <div
          className="blob w-80 h-80 bg-cyan-300 top-1/2 -right-20"
          style={{ animationDelay: "2s" }}
        />
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
