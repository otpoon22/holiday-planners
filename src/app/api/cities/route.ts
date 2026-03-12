import { NextRequest, NextResponse } from "next/server";

// Notable districts, neighbourhoods & areas that tourists actually search for
// These don't appear in city databases but are major destinations in their own right
const NOTABLE_DISTRICTS: Record<string, { name: string; countryCode: string; population: number }[]> = {
  KR: [
    { name: "Gangnam", countryCode: "KR", population: 560000 },
    { name: "Hongdae", countryCode: "KR", population: 400000 },
    { name: "Myeongdong", countryCode: "KR", population: 300000 },
    { name: "Itaewon", countryCode: "KR", population: 250000 },
    { name: "Insadong", countryCode: "KR", population: 200000 },
    { name: "Bukchon", countryCode: "KR", population: 150000 },
  ],
  JP: [
    { name: "Shibuya", countryCode: "JP", population: 230000 },
    { name: "Shinjuku", countryCode: "JP", population: 350000 },
    { name: "Harajuku", countryCode: "JP", population: 200000 },
    { name: "Ginza", countryCode: "JP", population: 150000 },
    { name: "Akihabara", countryCode: "JP", population: 180000 },
    { name: "Asakusa", countryCode: "JP", population: 150000 },
    { name: "Roppongi", countryCode: "JP", population: 130000 },
    { name: "Dotonbori", countryCode: "JP", population: 120000 },
  ],
  HK: [
    { name: "Tsim Sha Tsui", countryCode: "HK", population: 300000 },
    { name: "Mong Kok", countryCode: "HK", population: 350000 },
    { name: "Central", countryCode: "HK", population: 250000 },
    { name: "Wan Chai", countryCode: "HK", population: 200000 },
    { name: "Causeway Bay", countryCode: "HK", population: 280000 },
    { name: "Sham Shui Po", countryCode: "HK", population: 220000 },
    { name: "Lan Kwai Fong", countryCode: "HK", population: 100000 },
  ],
  TH: [
    { name: "Khao San Road", countryCode: "TH", population: 100000 },
    { name: "Sukhumvit", countryCode: "TH", population: 300000 },
    { name: "Silom", countryCode: "TH", population: 250000 },
    { name: "Old Town Bangkok", countryCode: "TH", population: 200000 },
  ],
  GB: [
    { name: "Shoreditch", countryCode: "GB", population: 150000 },
    { name: "Camden", countryCode: "GB", population: 250000 },
    { name: "Soho", countryCode: "GB", population: 130000 },
    { name: "Covent Garden", countryCode: "GB", population: 120000 },
    { name: "Notting Hill", countryCode: "GB", population: 140000 },
    { name: "Brixton", countryCode: "GB", population: 200000 },
  ],
  US: [
    { name: "Manhattan", countryCode: "US", population: 1600000 },
    { name: "Brooklyn", countryCode: "US", population: 2600000 },
    { name: "Hollywood", countryCode: "US", population: 300000 },
    { name: "Venice Beach", countryCode: "US", population: 150000 },
    { name: "Waikiki", countryCode: "US", population: 200000 },
  ],
  SG: [
    { name: "Chinatown", countryCode: "SG", population: 200000 },
    { name: "Little India", countryCode: "SG", population: 150000 },
    { name: "Marina Bay", countryCode: "SG", population: 120000 },
    { name: "Kampong Glam", countryCode: "SG", population: 100000 },
    { name: "Orchard Road", countryCode: "SG", population: 180000 },
  ],
  IT: [
    { name: "Trastevere", countryCode: "IT", population: 150000 },
    { name: "Amalfi", countryCode: "IT", population: 50000 },
    { name: "Cinque Terre", countryCode: "IT", population: 50000 },
  ],
  FR: [
    { name: "Montmartre", countryCode: "FR", population: 200000 },
    { name: "Le Marais", countryCode: "FR", population: 150000 },
    { name: "Saint-Germain", countryCode: "FR", population: 130000 },
  ],
  ES: [
    { name: "La Rambla", countryCode: "ES", population: 150000 },
    { name: "Gothic Quarter", countryCode: "ES", population: 120000 },
  ],
  TR: [
    { name: "Sultanahmet", countryCode: "TR", population: 200000 },
    { name: "Beyoğlu", countryCode: "TR", population: 250000 },
    { name: "Kadıköy", countryCode: "TR", population: 450000 },
  ],
  ID: [
    { name: "Ubud", countryCode: "ID", population: 75000 },
    { name: "Seminyak", countryCode: "ID", population: 60000 },
    { name: "Kuta", countryCode: "ID", population: 65000 },
    { name: "Canggu", countryCode: "ID", population: 50000 },
  ],
  AE: [
    { name: "Dubai Marina", countryCode: "AE", population: 200000 },
    { name: "Jumeirah", countryCode: "AE", population: 150000 },
    { name: "Deira", countryCode: "AE", population: 300000 },
  ],
  MY: [
    { name: "Bukit Bintang", countryCode: "MY", population: 200000 },
    { name: "Chinatown KL", countryCode: "MY", population: 150000 },
    { name: "Georgetown", countryCode: "MY", population: 700000 },
  ],
  VN: [
    { name: "Old Quarter Hanoi", countryCode: "VN", population: 300000 },
    { name: "Hoi An", countryCode: "VN", population: 120000 },
  ],
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json([]);
  }

  const upperCode = code.toUpperCase();

  // Try multiple sources in order of reliability
  const result =
    (await tryOpenDataSoft(upperCode)) ||
    (await tryCountriesNowPopulation(upperCode)) ||
    [];

  // Merge in notable districts/neighbourhoods that tourists actually visit
  const extras = NOTABLE_DISTRICTS[upperCode] || [];
  if (extras.length > 0) {
    const existingNames = new Set(result.map((c: { name: string }) => c.name.toLowerCase()));
    for (const extra of extras) {
      if (!existingNames.has(extra.name.toLowerCase())) {
        result.push(extra);
      }
    }
  }

  return NextResponse.json(result);
}

// Source 1: Open Data Soft — free, no key, has population data for all world cities
async function tryOpenDataSoft(code: string) {
  try {
    const res = await fetch(
      `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?where=country_code%3D%22${code}%22&order_by=population%20DESC&limit=30`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const seen = new Set<string>();
    const cities = data.results
      .filter((city: { population: number; name: string }) => {
        // Only cities with 50k+ population
        if (city.population < 50000) return false;
        const key = city.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(
        (city: {
          name: string;
          population: number;
          coordinates: { lat: number; lon: number };
        }) => ({
          name: city.name,
          countryCode: code,
          population: city.population,
        })
      );

    return cities.length > 0 ? cities : null;
  } catch {
    return null;
  }
}

// Source 2: CountriesNow population endpoint
async function tryCountriesNowPopulation(code: string) {
  try {
    const res = await fetch(
      "https://countriesnow.space/api/v0.1/countries/population/cities/filter",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limit: 30,
          order: "dsc",
          orderBy: "population",
          iso2: code,
        }),
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.data || data.data.length === 0) return null;

    const cities = data.data.map(
      (city: {
        city: string;
        populationCounts?: { value: number }[];
      }) => ({
        name: city.city,
        countryCode: code,
        population: city.populationCounts?.[0]?.value || 0,
      })
    );

    return cities.length > 0 ? cities : null;
  } catch {
    return null;
  }
}
