import { Camera, Clock } from "lucide-react";
import Image from "next/image";
import type { InstagramSpot } from "@/data/destinations";

interface InstagramSpotsProps {
  spots: InstagramSpot[];
}

export function InstagramSpots({ spots }: InstagramSpotsProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Camera className="w-6 h-6 text-pink-500" />
        <h2 className="text-2xl font-bold">
          <span className="instagram-gradient">Instagram Hotspots</span>
        </h2>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        The most photogenic spots that influencers love
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {spots.map((spot, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-white shadow-md card-hover group"
            style={{
              border: "2px solid transparent",
              backgroundClip: "padding-box",
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600" />
            <div className="relative h-44 overflow-hidden">
              <Image
                src={spot.imageUrl}
                alt={spot.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-foreground mb-1">{spot.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {spot.description}
              </p>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-0.5">Why it&apos;s famous</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {spot.whyFamous}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {spot.bestTimeToVisit}
                </span>
                <span className="instagram-gradient font-semibold">
                  {spot.hashtag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
