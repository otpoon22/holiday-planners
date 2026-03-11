"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { DestinationCard } from "@/components/DestinationCard";
import { destinations } from "@/data/destinations";
import { Plane, Globe, Utensils, Camera } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [continentFilter, setContinentFilter] = useState("All");

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent =
        continentFilter === "All" || dest.continent === continentFilter;
      return matchesSearch && matchesContinent;
    });
  }, [searchQuery, continentFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Plan Your Perfect
            <span className="text-primary block mt-2">Holiday</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Explore destinations, find the best flights, discover amazing food,
            and uncover the most instagrammable spots around the world.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-3 text-gray-300">
              <Globe className="w-6 h-6 text-primary" />
              <span>8 Destinations</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Plane className="w-6 h-6 text-primary" />
              <span>Flight Finder</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Utensils className="w-6 h-6 text-primary" />
              <span>Food Guide</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Camera className="w-6 h-6 text-primary" />
              <span>Instagram Spots</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="max-w-6xl mx-auto px-6 -mt-8">
        <SearchBar
          onSearch={setSearchQuery}
          onFilterContinent={setContinentFilter}
        />
      </section>

      {/* Destinations Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">Explore Destinations</h2>
        <p className="text-gray-500 mb-10">
          Pick a city and dive into everything it has to offer
        </p>

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No destinations found</p>
            <p className="text-sm mt-2">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.slug} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <span className="text-white font-bold text-lg">Voyagr</span>
          </div>
          <p className="text-sm">
            Made with love for the best holidays ever.
          </p>
        </div>
      </footer>
    </div>
  );
}
