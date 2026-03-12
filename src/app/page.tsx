"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { searchCountries, type Country } from "@/lib/api";
import {
  Plane,
  Globe,
  Utensils,
  Camera,
  Search,
  MapPin,
  ChevronRight,
  CalendarDays,
  Compass,
  Sun,
  Palmtree,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [dropdownResults, setDropdownResults] = useState<Country[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingDropdown, setSearchingDropdown] = useState(false);

  // Live search as user types — shows dropdown
  const handleInputChange = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setDropdownResults([]);
      setShowDropdown(false);
      return;
    }
    setSearchingDropdown(true);
    setShowDropdown(true);
    const results = await searchCountries(value);
    setDropdownResults(results);
    setSearchingDropdown(false);
  }, []);

  const handleDropdownSelect = (country: Country) => {
    setShowDropdown(false);
    setQuery(country.name);
    router.push(`/country/${country.code}?name=${encodeURIComponent(country.name)}`);
  };

  const handleSearch = useCallback(async () => {
    if (query.length < 2) return;
    setLoading(true);
    setHasSearched(true);
    setShowDropdown(false);
    const results = await searchCountries(query);
    if (results.length === 1) {
      router.push(`/country/${results[0].code}?name=${encodeURIComponent(results[0].name)}`);
      return;
    }
    setCountries(results);
    setLoading(false);
  }, [query, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient-warm text-white py-24 md:py-32 px-6 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/80 mb-8">
            <Sun className="w-4 h-4 text-warm" />
            <span>Your next adventure starts here</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Where Will You
            <span className="block mt-1">
              <span className="text-primary">Go Next</span>?
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Plan your dream holiday from start to finish. Search destinations,
            get personalized itineraries, and discover the best food and sights.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/plan"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center gap-3"
            >
              <CalendarDays className="w-5 h-5" />
              Plan Your Trip
            </Link>
            <button
              onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}
              className="glass text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:bg-white/15 flex items-center gap-3"
            >
              <Compass className="w-5 h-5" />
              Explore Destinations
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: Plane, label: "Flight Planning", color: "text-primary" },
              { icon: MapPin, label: "Day-by-Day Itinerary", color: "text-teal" },
              { icon: Utensils, label: "Food Recommendations", color: "text-warm" },
              { icon: Camera, label: "Photo Spots", color: "text-primary-light" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3 text-gray-300">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Three simple steps to your perfect holiday
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Globe,
                title: "Pick Your Destination",
                desc: "Search any country or city in the world. Browse popular spots or explore somewhere new.",
                color: "bg-primary/10 text-primary",
              },
              {
                step: "2",
                icon: CalendarDays,
                title: "Set Your Dates",
                desc: "Choose your departure airport, travel dates, and how many days you want to explore.",
                color: "bg-teal/10 text-teal",
              },
              {
                step: "3",
                icon: Palmtree,
                title: "Get Your Itinerary",
                desc: "Receive a day-by-day plan with sightseeing, food spots, times, and travel tips.",
                color: "bg-warm/10 text-warm",
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center">
                <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">STEP {step}</div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Explore Destinations</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Search any country to discover its cities, or jump straight into a popular destination
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search any country... (e.g. Japan, Italy, Brazil)"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (dropdownResults.length > 0) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground placeholder:text-gray-400 focus:outline-none text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || query.length < 2}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Live dropdown as you type */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto z-30">
              {searchingDropdown ? (
                <div className="px-5 py-4 text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : dropdownResults.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400">No countries found</div>
              ) : (
                dropdownResults.map((c) => (
                  <button
                    key={c.code}
                    onMouseDown={() => handleDropdownSelect(c)}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{c.subregion || c.region}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Searching countries...</p>
          </div>
        )}

        {!loading && hasSearched && countries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No countries found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {!loading && countries.length > 0 && (
          <>
            <h3 className="text-xl font-bold mb-2">Did you mean?</h3>
            <p className="text-gray-500 mb-6">Multiple countries matched — pick one to explore its cities</p>
            <div className="max-w-xl space-y-2">
              {countries.map((country) => (
                <Link
                  key={country.code}
                  href={`/country/${country.code}?name=${encodeURIComponent(country.name)}`}
                >
                  <div className="bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md border border-gray-100 transition-all cursor-pointer group flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {country.name}
                      </span>
                      <span className="text-sm text-gray-400 ml-3">
                        {country.subregion || country.region}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Popular Destinations */}
        {!hasSearched && (
          <div>
            <h3 className="text-xl font-bold mb-2 text-center">Popular Destinations</h3>
            <p className="text-gray-400 mb-8 text-center">Quick links to get you started</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Japan", code: "JP", emoji: "JP" },
                { name: "Italy", code: "IT", emoji: "IT" },
                { name: "France", code: "FR", emoji: "FR" },
                { name: "Thailand", code: "TH", emoji: "TH" },
                { name: "Spain", code: "ES", emoji: "ES" },
                { name: "United States", code: "US", emoji: "US" },
                { name: "Australia", code: "AU", emoji: "AU" },
                { name: "Brazil", code: "BR", emoji: "BR" },
                { name: "South Korea", code: "KR", emoji: "KR" },
                { name: "Greece", code: "GR", emoji: "GR" },
                { name: "Mexico", code: "MX", emoji: "MX" },
                { name: "Portugal", code: "PT", emoji: "PT" },
              ].map((c) => (
                <Link
                  key={c.code}
                  href={`/country/${c.code}?name=${encodeURIComponent(c.name)}`}
                >
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer text-center group card-hover">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {c.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-primary/5 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Holiday?</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Get a complete day-by-day itinerary with flights, activities, food spots, and more.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-primary/25"
          >
            <Plane className="w-5 h-5" />
            Start Planning
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <span className="text-white font-bold text-lg">Garden Leavers Travel Guide</span>
          </div>
          <p className="text-sm">Made with love for the best holidays ever.</p>
        </div>
      </footer>
    </div>
  );
}
