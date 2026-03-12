"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import {
  MapPin,
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CityItem {
  name: string;
  countryCode: string;
  population: number;
}

interface CityWithImage extends CityItem {
  imageUrl: string | null;
  imageLoaded: boolean;
}

type SortOption = "popular" | "a-z" | "z-a";

const CITIES_PER_PAGE = 20;

export default function CountryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const countryName = searchParams.get("name") || code;

  const [cities, setCities] = useState<CityWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [page, setPage] = useState(1);

  // Load cities
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/cities?code=${code}`);
      if (res.ok) {
        const data: CityItem[] = await res.json();
        // Initialize with no images yet
        const withImages: CityWithImage[] = data.map((c) => ({
          ...c,
          imageUrl: null,
          imageLoaded: false,
        }));
        setCities(withImages);
      }
      setLoading(false);
    }
    load();
  }, [code]);

  // Fetch Wikipedia images for visible cities
  useEffect(() => {
    if (cities.length === 0) return;

    const startIdx = (page - 1) * CITIES_PER_PAGE;
    const visibleCities = filteredCities.slice(startIdx, startIdx + CITIES_PER_PAGE);

    visibleCities.forEach((city) => {
      if (city.imageLoaded) return;

      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city.name + ", " + countryName)}`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) {
            // Try without country name
            return fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city.name)}`
            ).then((res) => (res.ok ? res.json() : null));
          }
          return data;
        })
        .then((data) => {
          const url =
            data?.thumbnail?.source?.replace(/\/\d+px-/, "/400px-") ||
            data?.originalimage?.source ||
            null;

          setCities((prev) =>
            prev.map((c) =>
              c.name === city.name
                ? { ...c, imageUrl: url, imageLoaded: true }
                : c
            )
          );
        })
        .catch(() => {
          setCities((prev) =>
            prev.map((c) =>
              c.name === city.name ? { ...c, imageLoaded: true } : c
            )
          );
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.length, page, countryName]);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  const filteredCities = useMemo(() => {
    let result = [...cities];

    if (search) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "popular") {
      result.sort((a, b) => (b.population || 0) - (a.population || 0));
    } else if (sortBy === "a-z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "z-a") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [cities, search, sortBy]);

  const totalPages = Math.ceil(filteredCities.length / CITIES_PER_PAGE);
  const paginatedCities = filteredCities.slice(
    (page - 1) * CITIES_PER_PAGE,
    page * CITIES_PER_PAGE
  );

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Most Popular" },
    { value: "a-z", label: "A → Z" },
    { value: "z-a", label: "Z → A" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="hero-gradient text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{countryName}</h1>
          <p className="text-gray-300 text-lg">
            {cities.length > 0
              ? `${cities.length} major cities to explore`
              : loading
              ? "Loading cities..."
              : "Loading..."}
          </p>
        </div>
      </section>

      {/* Search & Sort Bar */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search cities in ${countryName}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  sortBy === opt.value
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {opt.value === "popular" ? (
                  <ArrowUpDown className="w-4 h-4" />
                ) : opt.value === "a-z" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading cities...</p>
          </div>
        )}

        {!loading && filteredCities.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No cities found</p>
            {search && (
              <p className="text-sm mt-2">Try a different search</p>
            )}
          </div>
        )}

        {!loading && filteredCities.length > 0 && (
          <>
            {/* Results info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * CITIES_PER_PAGE + 1}–
                {Math.min(page * CITIES_PER_PAGE, filteredCities.length)} of{" "}
                {filteredCities.length} cities
                {search && (
                  <span>
                    {" "}matching &ldquo;<strong>{search}</strong>&rdquo;
                  </span>
                )}
              </p>
            </div>

            {/* City Cards Grid — 5 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {paginatedCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/city/${encodeURIComponent(city.name)}?country=${encodeURIComponent(countryName)}&code=${code}`}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md card-hover cursor-pointer group border border-gray-100">
                    {/* City Image */}
                    <div className="relative h-36 bg-gray-100 overflow-hidden">
                      {city.imageUrl ? (
                        <Image
                          src={city.imageUrl}
                          alt={city.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          {city.imageLoaded ? (
                            <MapPin className="w-8 h-8 text-primary/30" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          )}
                        </div>
                      )}
                      {/* Population badge */}
                      {city.population > 0 && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {city.population >= 1_000_000
                            ? `${(city.population / 1_000_000).toFixed(1)}M`
                            : `${(city.population / 1_000).toFixed(0)}K`}
                        </div>
                      )}
                    </div>

                    {/* City Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm leading-tight mb-1 truncate">
                        {city.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 truncate">
                          {countryName}
                        </p>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2
                    );
                  })
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          page === p
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
