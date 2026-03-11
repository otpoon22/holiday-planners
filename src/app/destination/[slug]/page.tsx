"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { FlightSearch } from "@/components/FlightSearch";
import { SightseeingList } from "@/components/SightseeingList";
import { FoodGuide } from "@/components/FoodGuide";
import { InstagramSpots } from "@/components/InstagramSpots";
import { destinations } from "@/data/destinations";
import {
  MapPin,
  Globe,
  Clock,
  Thermometer,
  Calendar,
  Languages,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DestinationPage() {
  const params = useParams();
  const slug = params.slug as string;

  const destination = useMemo(() => {
    return destinations.find((d) => d.slug === slug);
  }, [slug]);

  if (!destination) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Destination not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to destinations
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
              {destination.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90 text-lg">
              <MapPin className="w-5 h-5" />
              <span>{destination.country}</span>
            </div>
          </div>
        </div>
      </section>

      {/* City Info Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-gray-600 text-lg mb-6">{destination.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <InfoBadge
              icon={<Languages className="w-4 h-4" />}
              label="Language"
              value={destination.language}
            />
            <InfoBadge
              icon={<DollarSign className="w-4 h-4" />}
              label="Currency"
              value={destination.currency}
            />
            <InfoBadge
              icon={<Clock className="w-4 h-4" />}
              label="Timezone"
              value={destination.timezone}
            />
            <InfoBadge
              icon={<Thermometer className="w-4 h-4" />}
              label="Avg Temp"
              value={destination.averageTemp}
            />
            <InfoBadge
              icon={<Calendar className="w-4 h-4" />}
              label="Best Time"
              value={destination.bestTimeToVisit}
            />
            <InfoBadge
              icon={<Globe className="w-4 h-4" />}
              label="Continent"
              value={destination.continent}
            />
          </div>
        </div>
      </section>

      {/* Flights */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <FlightSearch flights={destination.flights} />
      </section>

      {/* Sightseeing */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <SightseeingList spots={destination.topSightseeing} />
        </div>
      </section>

      {/* Food Guide */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <FoodGuide spots={destination.foodSpots} />
      </section>

      {/* Instagram Spots */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <InstagramSpots spots={destination.instagramSpots} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            Made with love for the best holidays ever.
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
