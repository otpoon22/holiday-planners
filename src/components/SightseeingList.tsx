import { Star, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import type { Sightseeing } from "@/data/destinations";

interface SightseeingListProps {
  spots: Sightseeing[];
}

const categoryColors: Record<string, string> = {
  landmark: "bg-blue-100 text-blue-700",
  museum: "bg-purple-100 text-purple-700",
  nature: "bg-green-100 text-green-700",
  cultural: "bg-orange-100 text-orange-700",
  adventure: "bg-red-100 text-red-700",
};

export function SightseeingList({ spots }: SightseeingListProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <MapPin className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Top Things To Do</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {spots.map((spot, i) => (
          <div
            key={i}
            className="flex gap-4 bg-gray-50 rounded-xl p-4 card-hover"
          >
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
              <Image
                src={spot.imageUrl}
                alt={spot.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-sm leading-tight">
                  {spot.name}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    categoryColors[spot.category] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {spot.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {spot.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {spot.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {spot.estimatedTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
