import { Plane, CalendarDays } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Plane className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-foreground tracking-tight">
            Garden Leavers
          </span>
          <span className="text-xs text-gray-400 font-normal hidden sm:inline">
            Travel Guide
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/plan"
            className="text-sm font-semibold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Plan a Trip
          </Link>
        </div>
      </div>
    </nav>
  );
}
