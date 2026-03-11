"use client";

import { useState, useMemo } from "react";
import { Utensils, Star, MapPin } from "lucide-react";
import type { FoodSpot } from "@/data/destinations";

interface FoodGuideProps {
  spots: FoodSpot[];
}

const priceLevels = [
  { label: "All", value: 0 },
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];

export function FoodGuide({ spots }: FoodGuideProps) {
  const [priceFilter, setPriceFilter] = useState(0);

  const filteredSpots = useMemo(() => {
    if (priceFilter === 0) return spots;
    return spots.filter((s) => s.priceLevel === priceFilter);
  }, [spots, priceFilter]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Utensils className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Where To Eat</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        From street food to Michelin stars
      </p>

      {/* Price Filter */}
      <div className="flex gap-2 mb-8">
        {priceLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => setPriceFilter(level.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              priceFilter === level.value
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Restaurant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSpots.map((spot, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-foreground">{spot.name}</h3>
                <p className="text-xs text-gray-400">{spot.cuisine}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-primary font-bold text-sm">
                  {"$".repeat(spot.priceLevel)}
                </span>
                <span className="text-gray-200">
                  {"$".repeat(4 - spot.priceLevel)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {spot.description}
            </p>
            <div className="bg-primary/5 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-gray-400">Must try</p>
              <p className="text-sm font-semibold text-primary">
                {spot.specialtyDish}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {spot.address}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {spot.rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
