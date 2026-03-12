"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { searchCountries, type Country } from "@/lib/api";
import {
  Plane,
  MapPin,
  CalendarDays,
  Compass,
  Utensils,
  Camera,
  Luggage,
  Coffee,
  ChevronDown,
  Loader2,
  ExternalLink,
  ArrowRight,
  Search,
  Sparkles,
  Check,
  Waves,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  PoundSterling,
  Briefcase,
  BaggageClaim,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface FlightOption {
  id: string;
  airline: string;
  departure: string;
  departureCode: string;
  arrival: string;
  arrivalCode: string;
  outboundDepart: string;
  outboundArrive: string;
  returnDepart: string;
  returnArrive: string;
  duration: string;
  stops: number;
  stopCity?: string;
  price: number;
  currency: string;
  class: string;
  baggage: string;
  bookingUrl: string;
}

interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  category: "sightseeing" | "food" | "photo" | "travel" | "leisure" | "excursion";
  tip?: string;
  mapQuery?: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

interface ItineraryResult {
  flights: FlightOption[];
  itinerary: ItineraryDay[];
  city: string;
  country: string;
}

// ── Constants ──────────────────────────────────────────────────────

const POPULAR_AIRPORTS = [
  "London Heathrow", "London Gatwick", "London Stansted", "London Luton", "London City",
  "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Bristol",
  "Dublin", "New York JFK", "New York Newark", "Los Angeles LAX",
  "Paris CDG", "Paris Orly", "Amsterdam Schiphol", "Frankfurt",
  "Munich", "Zurich", "Madrid", "Barcelona", "Lisbon", "Rome Fiumicino",
  "Milan Malpensa", "Athens", "Istanbul", "Dubai", "Abu Dhabi", "Doha",
  "Singapore Changi", "Bangkok", "Tokyo Narita", "Tokyo Haneda", "Osaka Kansai",
  "Seoul Incheon", "Hong Kong", "Sydney", "Melbourne",
  "Toronto", "Vancouver", "Sao Paulo", "Mexico City", "Cape Town",
  "Delhi", "Mumbai", "Cairo", "Bali Denpasar", "Phuket",
];

const CABIN_CLASSES = [
  { value: "economy", label: "Economy", desc: "Standard seating" },
  { value: "premium_economy", label: "Premium Economy", desc: "Extra legroom" },
  { value: "business", label: "Business", desc: "Lie-flat seats" },
  { value: "first", label: "First Class", desc: "Ultimate luxury" },
];

const FLIGHT_SORTS = [
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "depart_early", label: "Departure: Early → Late" },
  { value: "depart_late", label: "Departure: Late → Early" },
];

const TIME_PREFS = [
  { value: "early", label: "Early Bird", sub: "Before 8am", icon: Sunrise },
  { value: "morning", label: "Morning", sub: "8am - 12pm", icon: Sun },
  { value: "afternoon", label: "Afternoon", sub: "12pm - 5pm", icon: Sunset },
  { value: "evening", label: "Evening", sub: "After 5pm", icon: Moon },
];

const categoryIcons: Record<string, typeof Compass> = {
  sightseeing: Compass,
  food: Utensils,
  photo: Camera,
  travel: Plane,
  leisure: Coffee,
  excursion: Waves,
};

const categoryColors: Record<string, string> = {
  sightseeing: "bg-primary/10 text-primary border-primary/20",
  food: "bg-orange-50 text-orange-600 border-orange-200",
  photo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  travel: "bg-teal/10 text-teal border-teal/20",
  leisure: "bg-purple-50 text-purple-600 border-purple-200",
  excursion: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const categoryLabels: Record<string, string> = {
  sightseeing: "Sightseeing",
  food: "Food & Drink",
  photo: "Photo Spot",
  travel: "Travel",
  leisure: "Leisure",
  excursion: "Excursion",
};

// ── Component ──────────────────────────────────────────────────────

export default function PlanPage() {
  // Form state
  const [departureAirport, setDepartureAirport] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [prefTime, setPrefTime] = useState("morning");
  const [cabinClass, setCabinClass] = useState("economy");
  const [flightSort, setFlightSort] = useState("price_asc");
  const [resultTab, setResultTab] = useState<"flights" | "itinerary" | "summary">("flights");

  // Search state
  const [countryResults, setCountryResults] = useState<Country[]>([]);
  const [cityResults, setCityResults] = useState<{ name: string; population: number }[]>([]);
  const [searchingCountries, setSearchingCountries] = useState(false);
  const [searchingCities, setSearchingCities] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");

  // Result state
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rebuildingItinerary, setRebuildingItinerary] = useState(false);
  const [error, setError] = useState("");
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set());

  // Derived
  const filterAirports = (query: string) =>
    query.length > 0
      ? POPULAR_AIRPORTS.filter((a) => a.toLowerCase().includes(query.toLowerCase()))
      : POPULAR_AIRPORTS;

  const filteredDepartureAirports = filterAirports(departureAirport);

  const sortedFlights = [...(result?.flights || [])].sort((a, b) => {
    if (flightSort === "price_asc") return a.price - b.price;
    if (flightSort === "price_desc") return b.price - a.price;
    if (flightSort === "depart_early") return a.outboundDepart.localeCompare(b.outboundDepart);
    if (flightSort === "depart_late") return b.outboundDepart.localeCompare(a.outboundDepart);
    return 0;
  });
  const filteredFlights = sortedFlights;

  const selectedFlight = result?.flights.find((f) => f.id === selectedFlightId) || result?.flights[0] || null;

  // ── Handlers ───────────────────────────────────────────────────

  const handleDestinationSearch = useCallback(async (query: string) => {
    setDestinationQuery(query);
    setSelectedCity("");
    setSelectedCountry("");
    setSelectedCountryCode("");
    setCityResults([]);

    if (query.length < 2) {
      setCountryResults([]);
      setShowCountryDropdown(false);
      return;
    }

    setSearchingCountries(true);
    setShowCountryDropdown(true);
    const results = await searchCountries(query);
    setCountryResults(results);
    setSearchingCountries(false);
  }, []);

  const handleCountrySelect = useCallback(async (country: Country) => {
    setSelectedCountry(country.name);
    setSelectedCountryCode(country.code);
    setShowCountryDropdown(false);
    setSearchingCities(true);
    setShowCityDropdown(true);

    const res = await fetch(`/api/cities?code=${country.code}`);
    if (res.ok) {
      const cities = await res.json();
      setCityResults(cities.slice(0, 20));
    }
    setSearchingCities(false);
  }, []);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setDestinationQuery(`${cityName}, ${selectedCountry}`);
    setShowCityDropdown(false);
  };

  const handleGenerate = async () => {
    if (!selectedCity || !selectedCountry || !departureDate || !returnDate || !departureAirport || numDays < 2) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedFlightId(null);

    try {
      const params = new URLSearchParams({
        city: selectedCity,
        country: selectedCountry,
        from: departureAirport,
        startDate: departureDate,
        days: numDays.toString(),
        prefTime,
        cabinClass,
      });
      const res = await fetch(`/api/itinerary?${params}`);
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setResult(data);
      setSelectedFlightId(data.flights[0]?.id || null);
      setResultTab("flights");
      setExpandedDays(new Set([1]));
      setExpandedFlights(new Set());

      setTimeout(() => {
        document.getElementById("itinerary-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Something went wrong generating your itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Rebuild itinerary when user picks a different flight
  const handleFlightSelect = async (flightId: string) => {
    if (!result || flightId === selectedFlightId) return;
    setSelectedFlightId(flightId);

    // Find the index of this flight in the original (unsorted) result
    const flightIndex = result.flights.findIndex((f) => f.id === flightId);
    if (flightIndex < 0) return;

    setRebuildingItinerary(true);
    try {
      const params = new URLSearchParams({
        city: result.city,
        country: result.country,
        from: departureAirport,
        startDate: departureDate,
        days: numDays.toString(),
        prefTime,
        cabinClass,
        flightIdx: flightIndex.toString(),
      });
      const res = await fetch(`/api/itinerary?${params}`);
      if (!res.ok) throw new Error("Failed to rebuild");
      const data = await res.json();
      // Only update itinerary, keep existing flights
      setResult((prev) => prev ? { ...prev, itinerary: data.itinerary } : prev);
      setExpandedDays(new Set([1]));
    } catch {
      // Silently fail — keep the old itinerary
    } finally {
      setRebuildingItinerary(false);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const expandAll = () => {
    if (result) setExpandedDays(new Set(result.itinerary.map((d) => d.day)));
  };

  const collapseAll = () => setExpandedDays(new Set());

  const toggleFlight = (id: string) => {
    setExpandedFlights((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const expandAllFlights = () => {
    if (result) setExpandedFlights(new Set(result.flights.map((f: FlightOption) => f.id)));
  };
  const collapseAllFlights = () => setExpandedFlights(new Set());

  // Compute trip duration from dates
  const numDays = departureDate && returnDate
    ? Math.max(2, Math.min(21, Math.round((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / 86400000) + 1))
    : 0;

  const isFormComplete = selectedCity && selectedCountry && departureDate && returnDate && departureAirport && numDays >= 2;
  const allExpanded = result ? expandedDays.size === result.itinerary.length : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero-gradient-warm text-white py-16 md:py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/80 mb-6">
            <Sparkles className="w-4 h-4 text-warm" />
            <span>Smart trip planning</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Plan Your <span className="text-primary">Dream Trip</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Flights, itineraries, restaurants, excursions &mdash; all planned for you in seconds.
          </p>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          {/* Row 1: Departure + Destination */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Departure */}
            <div className="relative">
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Plane className="w-4 h-4 inline mr-2 text-teal" />
                Departure
              </label>
              <input
                type="text"
                placeholder="e.g. London Heathrow, JFK, CDG..."
                value={departureAirport}
                onChange={(e) => { setDepartureAirport(e.target.value); setShowDepartureDropdown(true); }}
                onFocus={() => setShowDepartureDropdown(true)}
                onBlur={() => setTimeout(() => setShowDepartureDropdown(false), 200)}
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-foreground placeholder:text-gray-400"
              />
              {showDepartureDropdown && filteredDepartureAirports.length > 0 && departureAirport.length < 30 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-30">
                  {filteredDepartureAirports.map((airport) => (
                    <button
                      key={airport}
                      onMouseDown={() => { setDepartureAirport(airport); setShowDepartureDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Plane className="w-3.5 h-3.5 text-gray-400" />
                      {airport}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Compass className="w-4 h-4 inline mr-2 text-warm" />
                Destination
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search country, then pick a city..."
                  value={destinationQuery}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  onFocus={() => {
                    if (countryResults.length > 0 && !selectedCountryCode) setShowCountryDropdown(true);
                    if (cityResults.length > 0 && selectedCountryCode) setShowCityDropdown(true);
                  }}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-gray-400"
                />
              </div>
              {selectedCity && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  {selectedCity}, {selectedCountry}
                </div>
              )}

              {showCountryDropdown && !selectedCountryCode && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-30">
                  {searchingCountries ? (
                    <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Searching...</div>
                  ) : countryResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No countries found</div>
                  ) : (
                    countryResults.map((c) => (
                      <button key={c.code} onMouseDown={() => handleCountrySelect(c)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-gray-400">{c.region}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {showCityDropdown && selectedCountryCode && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-30">
                  {searchingCities ? (
                    <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading cities...</div>
                  ) : cityResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No cities found</div>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-50">Pick a city in {selectedCountry}</div>
                      {cityResults.map((c) => (
                        <button key={c.name} onMouseDown={() => handleCitySelect(c.name)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                          <span className="font-medium">{c.name}</span>
                          {c.population > 0 && <span className="text-xs text-gray-400">{c.population >= 1_000_000 ? `${(c.population / 1_000_000).toFixed(1)}M` : `${(c.population / 1_000).toFixed(0)}K`}</span>}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Departure Date + Return Date */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Departure Date */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <CalendarDays className="w-4 h-4 inline mr-2 text-warm" />
                Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => {
                  setDepartureDate(e.target.value);
                  if (returnDate && e.target.value > returnDate) setReturnDate("");
                }}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-warm/30 focus:border-warm transition-all ${departureDate ? "text-foreground" : "text-transparent"}`}
              />
            </div>

            {/* Return Date */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <CalendarDays className="w-4 h-4 inline mr-2 text-primary" />
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${returnDate ? "text-foreground" : "text-transparent"}`}
              />
              {numDays >= 2 && (
                <p className="text-xs text-gray-400 mt-1.5">{numDays} days</p>
              )}
            </div>
          </div>

          {/* Preferred Departure Time */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-foreground mb-3">
              <Sunrise className="w-4 h-4 inline mr-2 text-warm" />
              Preferred Departure Time
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TIME_PREFS.map(({ value, label, sub, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPrefTime(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    prefTime === value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${prefTime === value ? "text-primary" : "text-gray-400"}`} />
                  <p className={`text-sm font-semibold ${prefTime === value ? "text-primary" : "text-foreground"}`}>{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cabin Class */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-foreground mb-3">
              <Briefcase className="w-4 h-4 inline mr-2 text-teal" />
              Cabin Class
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CABIN_CLASSES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setCabinClass(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cabinClass === value
                      ? "border-teal bg-teal/5 ring-2 ring-teal/20"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-semibold ${cabinClass === value ? "text-teal" : "text-foreground"}`}>{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!isFormComplete || loading}
            className="w-full mt-8 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Building your dream trip...</>
            ) : (
              <><Sparkles className="w-5 h-5" />Generate Itinerary</>
            )}
          </button>

          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        </div>
      </section>

      {/* ── Results ── */}
      {result && (
        <section id="itinerary-results" className="max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-12 scroll-mt-20">

          {/* ── Tabs ── */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
            {([
              { key: "flights" as const, label: "Flight Options", icon: Plane },
              { key: "itinerary" as const, label: "Trip Itinerary", icon: CalendarDays },
              { key: "summary" as const, label: "Summary & Cost", icon: PoundSterling },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setResultTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  resultTab === key
                    ? "bg-white text-foreground shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* ── Flight Options ── */}
          {resultTab === "flights" && (
          <div className="mb-12 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                <Plane className="w-5 h-5 text-teal" />
              </div>
              Flight Options
            </h2>
            <div className="flex items-center justify-between mb-4 ml-0 sm:ml-[52px]">
              <p className="text-sm text-gray-400">
                {result.flights.length} options found &mdash; select a flight to build your itinerary around
              </p>
              <button
                onClick={expandedFlights.size === filteredFlights.length ? collapseAllFlights : expandAllFlights}
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                {expandedFlights.size === filteredFlights.length ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2 mb-4 ml-0 sm:ml-[52px] flex-wrap">
              {FLIGHT_SORTS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFlightSort(value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      flightSort === value
                        ? "bg-teal text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFlights.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No flights found for this route</p>
                </div>
              ) : filteredFlights.map((flight, i) => {
                const isSelected = flight.id === selectedFlightId;
                const isExpanded = expandedFlights.has(flight.id);
                const cheapestPrice = Math.min(...filteredFlights.map((f) => f.price));
                const isCheapest = flight.price === cheapestPrice;
                return (
                  <div
                    key={flight.id}
                    className={`rounded-2xl border-2 transition-all overflow-hidden ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {/* Compact header — always visible */}
                    <button
                      onClick={() => toggleFlight(flight.id)}
                      className="w-full text-left px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{flight.airline}</span>
                            {isCheapest && (
                              <span className="text-[9px] sm:text-xs bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">Best</span>
                            )}
                          </div>
                          <span className="text-[11px] sm:text-xs text-gray-400">
                            {flight.outboundDepart} → {flight.outboundArrive}
                            {flight.stops > 0 && ` via ${flight.stopCity}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-0.5">
                            <PoundSterling className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground" />
                            <span className="text-lg sm:text-xl font-bold text-foreground">{flight.price}</span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-gray-400">{flight.stops === 0 ? "Direct" : `${flight.stops} stop`} · {flight.duration}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 sm:px-5 pb-4 sm:pb-5 border-t border-gray-50 pt-3 sm:pt-4">
                        {/* Select flight button */}
                        {!isSelected && (
                          <button
                            onClick={() => handleFlightSelect(flight.id)}
                            className="mb-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                          >
                            {rebuildingItinerary ? "Updating itinerary..." : "Select this flight"}
                          </button>
                        )}

                        {/* Flight times */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Outbound */}
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-bold text-foreground">{flight.outboundDepart}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{flight.departureCode}</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center px-2">
                              <span className="text-[10px] text-gray-400">{flight.duration}</span>
                              <div className="w-full flex items-center gap-1 my-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                                <div className="h-px bg-gray-300 flex-1 relative">
                                  {flight.stops > 0 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 border border-white" />}
                                </div>
                                <Plane className="w-3 h-3 text-teal" />
                              </div>
                              <span className="text-[10px] text-gray-400">{flight.stops === 0 ? "Direct" : `${flight.stops} stop`}</span>
                            </div>
                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-bold text-foreground">{flight.outboundArrive}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{flight.arrivalCode}</p>
                            </div>
                          </div>

                          {/* Return */}
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-bold text-foreground">{flight.returnDepart}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{flight.arrivalCode}</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center px-2">
                              <span className="text-[10px] text-gray-400">{flight.duration}</span>
                              <div className="w-full flex items-center gap-1 my-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                                <div className="h-px bg-gray-300 flex-1 relative">
                                  {flight.stops > 0 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 border border-white" />}
                                </div>
                                <Plane className="w-3 h-3 text-teal rotate-180" />
                              </div>
                              <span className="text-[10px] text-gray-400">{flight.stops === 0 ? "Direct" : `${flight.stops} stop`}</span>
                            </div>
                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-bold text-foreground">{flight.returnArrive}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{flight.departureCode}</p>
                            </div>
                          </div>
                        </div>

                        {/* Baggage + class + booking */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><BaggageClaim className="w-3 h-3" />{flight.baggage}</span>
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{flight.class}</span>
                          </div>
                          <a
                            href={flight.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-colors shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Book on Skyscanner
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* ── Itinerary ── */}
          {resultTab === "itinerary" && (
          <div className="animate-fade-in-up">
            {rebuildingItinerary && (
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <p className="text-sm text-primary font-medium">Rebuilding itinerary for your selected flight...</p>
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                Your {numDays}-Day Itinerary
              </h2>
              <button
                onClick={allExpanded ? collapseAll : expandAll}
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>

            <div className="space-y-4">
              {result.itinerary.map((day) => (
                <div
                  key={day.day}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                >
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDay(day.day)}
                    className="w-full px-3 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
                        {day.day}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-foreground">{day.theme}</h3>
                        <p className="text-sm text-gray-400">{day.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Mini category pills */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {Array.from(new Set(day.activities.map((a) => a.category))).map((cat) => {
                          const Icon = categoryIcons[cat] || Compass;
                          const color = categoryColors[cat] || "bg-gray-50 text-gray-500";
                          return (
                            <div key={cat} className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {day.activities.length} activities
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedDays.has(day.day) ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Day Activities */}
                  {expandedDays.has(day.day) && (
                    <div className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3 border-t border-gray-50">
                      {day.activities.map((activity, i) => {
                        const Icon = categoryIcons[activity.category] || Compass;
                        const colorClass = categoryColors[activity.category] || "bg-gray-50 text-gray-600 border-gray-200";
                        const label = categoryLabels[activity.category] || activity.category;

                        // Extract food tier from tip if it's a food activity
                        let foodTier: string | null = null;
                        let tipText = activity.tip || "";
                        if (activity.category === "food" && tipText) {
                          const tierMatch = tipText.match(/^(Budget Eats|Mid-Range|Upscale|Fine Dining)\.\s*/);
                          if (tierMatch) {
                            foodTier = tierMatch[1];
                            tipText = tipText.slice(tierMatch[0].length);
                          }
                        }

                        const tierBadgeColors: Record<string, string> = {
                          "Budget Eats": "bg-green-100 text-green-700",
                          "Mid-Range": "bg-blue-100 text-blue-700",
                          "Upscale": "bg-amber-100 text-amber-700",
                          "Fine Dining": "bg-purple-100 text-purple-700",
                        };

                        return (
                          <div key={i} className="flex gap-2 sm:gap-4 pt-4">
                            {/* Time column */}
                            <div className="w-11 sm:w-14 shrink-0 pt-1 text-right">
                              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{activity.time}</span>
                            </div>

                            {/* Content */}
                            <div className={`flex-1 min-w-0 rounded-xl p-3 sm:p-4 border ${colorClass}`}>
                              <div className="flex flex-wrap items-start gap-1.5 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <Icon className="w-4 h-4 shrink-0" />
                                  <h4 className="font-semibold text-xs sm:text-sm break-words">{activity.title}</h4>
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {foodTier && (
                                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap font-semibold ${tierBadgeColors[foodTier] || "bg-gray-100 text-gray-600"}`}>
                                      {foodTier}
                                    </span>
                                  )}
                                  <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${colorClass}`}>
                                    {label}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                                {activity.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {tipText && (
                                  <span className="text-[10px] sm:text-[11px] text-gray-400 italic leading-tight">
                                    {tipText}
                                  </span>
                                )}
                                {activity.mapQuery && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.mapQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium shrink-0"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Maps
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* ── Summary ── */}
          {resultTab === "summary" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Luggage className="w-5 h-5 text-primary" />
              Trip Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Days", value: numDays, color: "text-primary", bg: "bg-primary/5" },
                { label: "Sights", value: result.itinerary.reduce((s, d) => s + d.activities.filter((a) => a.category === "sightseeing").length, 0), color: "text-primary", bg: "bg-primary/5" },
                { label: "Restaurants", value: result.itinerary.reduce((s, d) => s + d.activities.filter((a) => a.category === "food").length, 0), color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Excursions", value: result.itinerary.reduce((s, d) => s + d.activities.filter((a) => a.category === "excursion").length, 0), color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Photo Spots", value: result.itinerary.reduce((s, d) => s + d.activities.filter((a) => a.category === "photo").length, 0), color: "text-indigo-500", bg: "bg-indigo-50" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`text-center p-4 rounded-xl ${bg}`}>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {selectedFlight && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-teal" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedFlight.airline}</p>
                    <p className="text-xs text-gray-400">{selectedFlight.stops === 0 ? "Direct" : `${selectedFlight.stops} stop via ${selectedFlight.stopCity}`} &middot; {selectedFlight.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <PoundSterling className="w-4 h-4 text-foreground" />
                    <span className="text-xl font-bold text-foreground">{selectedFlight.price}</span>
                  </div>
                  <span className="text-xs text-gray-400">pp return</span>
                </div>
              </div>
            )}

            {/* Explore More */}
            <div className="mt-6 text-center">
              <a
                href={`/city/${encodeURIComponent(result.city)}?country=${encodeURIComponent(result.country)}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Explore {result.city} in detail
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          )}
        </section>
      )}

      {/* ── Loading ── */}
      {loading && (
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">Building your perfect trip...</h3>
            <p className="text-gray-400 mb-1">Searching flights, restaurants, excursions &amp; photo spots</p>
            <p className="text-sm text-gray-300">{selectedCity}, {selectedCountry}</p>
          </div>
          <div className="mt-10 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="shimmer h-5 rounded w-1/3 mb-3" />
                <div className="shimmer h-4 rounded w-2/3 mb-2" />
                <div className="shimmer h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Empty State ── */}
      {!result && !loading && (
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center text-gray-400">
            <Compass className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Fill in the details above to generate your itinerary</p>
            <p className="text-sm mt-2">We&apos;ll find flights, plan your days, and suggest the best restaurants and activities</p>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="bg-secondary text-gray-400 py-12 px-6 mt-8">
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
