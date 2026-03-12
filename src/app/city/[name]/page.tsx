"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  MapPin,
  ArrowLeft,
  Compass,
  Utensils,
  Camera,
  ExternalLink,
  Loader2,
  Clock,
  Phone,
  Globe,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CityInfo {
  name: string;
  country: string;
  description: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
}

interface SightPlace {
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  pageviews: number;
  wikiUrl: string;
}

interface FoodPlace {
  name: string;
  cuisine: string;
  description: string;
  website: string | null;
  phone: string | null;
  openingHours: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  score: number;
}

interface PhotoSpot {
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  score: number;
}

const categoryColors: Record<string, string> = {
  Museum: "bg-purple-100 text-purple-700",
  Palace: "bg-amber-100 text-amber-700",
  Landmark: "bg-blue-100 text-blue-700",
  "Temple / Church": "bg-orange-100 text-orange-700",
  "Park & Garden": "bg-green-100 text-green-700",
  Square: "bg-teal-100 text-teal-700",
  Attraction: "bg-rose-100 text-rose-700",
  "Theme Park": "bg-pink-100 text-pink-700",
  Shopping: "bg-fuchsia-100 text-fuchsia-700",
  Beach: "bg-cyan-100 text-cyan-700",
  Nature: "bg-emerald-100 text-emerald-700",
  "Zoo & Aquarium": "bg-lime-100 text-lime-700",
  Entertainment: "bg-violet-100 text-violet-700",
  Experience: "bg-sky-100 text-sky-700",
  Market: "bg-yellow-100 text-yellow-700",
  Viewpoint: "bg-indigo-100 text-indigo-700",
  Rooftop: "bg-rose-100 text-rose-700",
  "Mountain View": "bg-emerald-100 text-emerald-700",
  "Observation Deck": "bg-sky-100 text-sky-700",
  "Scenic Spot": "bg-amber-100 text-amber-700",
  Heritage: "bg-orange-100 text-orange-700",
  Park: "bg-green-100 text-green-700",
};

export default function CityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cityName = decodeURIComponent(params.name as string);
  const country = searchParams.get("country") || "";
  const countryCode = searchParams.get("code") || "";

  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [sights, setSights] = useState<SightPlace[]>([]);
  const [food, setFood] = useState<FoodPlace[]>([]);
  const [photos, setPhotos] = useState<PhotoSpot[]>([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingSights, setLoadingSights] = useState(false);
  const [loadingFood, setLoadingFood] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Load city details
  useEffect(() => {
    async function load() {
      setLoadingCity(true);
      const res = await fetch(
        `/api/city-details?city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}`
      );
      if (res.ok) setCityInfo(await res.json());
      setLoadingCity(false);
    }
    load();
  }, [cityName, country]);

  // Load sights & food when we have coords
  useEffect(() => {
    if (!cityInfo || (cityInfo.latitude === 0 && cityInfo.longitude === 0))
      return;

    setLoadingSights(true);
    setLoadingFood(true);
    setLoadingPhotos(true);

    fetch(
      `/api/attractions?lat=${cityInfo.latitude}&lon=${cityInfo.longitude}&kind=sights&city=${encodeURIComponent(cityName)}`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then(setSights)
      .finally(() => setLoadingSights(false));

    fetch(
      `/api/attractions?lat=${cityInfo.latitude}&lon=${cityInfo.longitude}&kind=foods&city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then(setFood)
      .finally(() => setLoadingFood(false));

    fetch(
      `/api/attractions?lat=${cityInfo.latitude}&lon=${cityInfo.longitude}&kind=photos&city=${encodeURIComponent(cityName)}`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then(setPhotos)
      .finally(() => setLoadingPhotos(false));
  }, [cityInfo, cityName]);

  const backUrl = countryCode
    ? `/country/${countryCode}?name=${encodeURIComponent(country)}`
    : "/";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] min-h-[350px] overflow-hidden bg-secondary">
        {cityInfo?.imageUrl && (
          <Image
            src={cityInfo.imageUrl}
            alt={cityName}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {country || "search"}
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {cityName}
            </h1>
            {country && (
              <div className="flex items-center gap-2 text-white/80 text-lg">
                <MapPin className="w-5 h-5" />
                <span>{country}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {loadingCity ? (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-1/2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      ) : cityInfo ? (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              {cityInfo.description}
            </p>
          </div>
        </div>
      ) : null}

      {/* Sticky Section Tabs */}
      <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => scrollTo("must-dos")}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-foreground hover:text-primary border-b-2 border-primary transition-colors"
            >
              <Compass className="w-4 h-4" />
              Top 10 Must Do&apos;s
            </button>
            <button
              onClick={() => scrollTo("food-spots")}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-gray-400 hover:text-orange-500 border-b-2 border-transparent hover:border-orange-500 transition-colors"
            >
              <Utensils className="w-4 h-4" />
              Top 10 Food Spots
            </button>
            <button
              onClick={() => scrollTo("photo-spots")}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-gray-400 hover:text-indigo-500 border-b-2 border-transparent hover:border-indigo-500 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Photo Spots
            </button>
          </div>
        </div>
      </div>

      {/* TOP 10 MUST DO'S */}
      <section id="must-dos" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-32">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Top 10 Must Do&apos;s</h2>
            <p className="text-gray-400 text-sm">
              The essential experiences in {cityName}
            </p>
          </div>
        </div>

        {loadingSights ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-gray-400">
              Finding the best things to do in {cityName}...
            </p>
          </div>
        ) : sights.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Compass className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No attractions found yet — try another city</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {sights.map((place, i) => (
              <div
                key={`${place.name}-${i}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex"
              >
                {/* Image */}
                {place.imageUrl && (
                  <div className="relative w-32 md:w-44 shrink-0">
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Rank badge */}
                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                )}

                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      {!place.imageUrl && (
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {i + 1}
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-foreground">
                        {place.name}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                        categoryColors[place.category] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {place.category}
                    </span>
                  </div>

                  {place.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {place.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <a
                      href={place.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <BookOpen className="w-3 h-3" />
                      Read more
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}+${encodeURIComponent(cityName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Maps
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-gray-200" />
      </div>

      {/* TOP 10 MUST TRY FOOD SPOTS */}
      <section id="food-spots" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-32">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Top 10 Must-Try Food Spots</h2>
            <p className="text-gray-400 text-sm">
              Where the locals and foodies eat in {cityName}
            </p>
          </div>
        </div>

        {loadingFood ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">
              Finding the best restaurants in {cityName}...
            </p>
          </div>
        ) : food.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No restaurants found yet — try another city</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {food.map((place, i) => (
              <div
                key={`${place.name}-${i}`}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-0.5">
                      {place.name}
                    </h3>
                    <div className="inline-block bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full mb-2">
                      {place.cuisine}
                    </div>

                    {place.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {place.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {place.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {place.address}
                        </span>
                      )}
                      {place.openingHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {place.openingHours}
                        </span>
                      )}
                      {place.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {place.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Website
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}+${encodeURIComponent(cityName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-gray-200" />
      </div>

      {/* TOP 10 PHOTO SPOTS */}
      <section id="photo-spots" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-32">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Camera className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Best Photo Spots</h2>
            <p className="text-gray-400 text-sm">
              Stunning views and picture-perfect locations in {cityName}
            </p>
          </div>
        </div>

        {loadingPhotos ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">
              Finding the best photo spots in {cityName}...
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No photo spots found yet — try another city</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((spot, i) => (
              <div
                key={`${spot.name}-${i}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex"
              >
                {/* Image */}
                {spot.imageUrl && (
                  <div className="relative w-32 md:w-40 shrink-0">
                    <Image
                      src={spot.imageUrl}
                      alt={spot.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                )}

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {!spot.imageUrl && (
                        <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {i + 1}
                        </div>
                      )}
                      <h3 className="font-bold text-foreground">
                        {spot.name}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                        categoryColors[spot.category] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {spot.category}
                    </span>
                  </div>

                  {spot.description && (
                    <p className="text-sm text-gray-500 mb-2">
                      {spot.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}+${encodeURIComponent(cityName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Maps
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-gray-400 py-12 px-6 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">Made with love for the best holidays ever.</p>
        </div>
      </footer>
    </div>
  );
}
