"use client";

import { useState, useMemo } from "react";
import { Plane, Clock, Search } from "lucide-react";
import type { Flight } from "@/data/destinations";

interface FlightSearchProps {
  flights: Flight[];
}

export function FlightSearch({ flights }: FlightSearchProps) {
  const [cabinClass, setCabinClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "duration">("price");

  const filteredFlights = useMemo(() => {
    let results = flights.filter((f) => f.price > 0);
    if (cabinClass !== "all") {
      results = results.filter((f) => f.cabinClass === cabinClass);
    }
    results.sort((a, b) =>
      sortBy === "price" ? a.price - b.price : a.duration.localeCompare(b.duration)
    );
    return results;
  }, [flights, cabinClass, sortBy]);

  const cabinClasses = ["all", "economy", "business", "first"];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Find Flights</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-500 mb-1.5 block">
              Cabin Class
            </label>
            <div className="flex gap-2 flex-wrap">
              {cabinClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setCabinClass(cls)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    cabinClass === cls
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cls === "all" ? "All Classes" : cls.charAt(0).toUpperCase() + cls.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">
              Sort By
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("price")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sortBy === "price"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Price
              </button>
              <button
                onClick={() => setSortBy("duration")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sortBy === "duration"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Duration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredFlights.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No flights available for this class</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFlights.map((flight, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {flight.airline}
                  </p>
                  <p className="text-sm text-gray-400">
                    {flight.cabinClass.charAt(0).toUpperCase() +
                      flight.cabinClass.slice(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground">
                    {flight.departureTime}
                  </p>
                  <p className="text-gray-400 text-xs">Depart</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-4 h-4 text-gray-300 mb-1" />
                  <div className="w-20 h-px bg-gray-200 relative">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                      {flight.duration}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {flight.stops === 0
                      ? "Direct"
                      : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground">
                    {flight.arrivalTime}
                  </p>
                  <p className="text-gray-400 text-xs">Arrive</p>
                </div>
              </div>

              <div className="price-tag text-lg">
                ${flight.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
