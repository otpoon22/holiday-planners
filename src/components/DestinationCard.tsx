import { MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/data/destinations";

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link href={`/destination/${destination.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md card-hover cursor-pointer group">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-foreground">
            {destination.continent}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{destination.country}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {destination.name}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {destination.description}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {destination.language}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {destination.currency}
            </span>
          </div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
            Explore
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
