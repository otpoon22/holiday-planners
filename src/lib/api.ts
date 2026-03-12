// Client-side API helpers

export interface Country {
  name: string;
  code: string;
  flag: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  languages: string[];
  currencies: string[];
  imageUrl: string;
}

export interface City {
  name: string;
  country: string;
  countryCode: string;
  population: number;
  latitude: number;
  longitude: number;
}

export interface CityDetails {
  name: string;
  country: string;
  description: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
}

export interface Attraction {
  name: string;
  description: string;
  kinds: string;
  rating: number;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
}

export interface FoodPlace {
  name: string;
  kinds: string;
  rating: number;
  latitude: number;
  longitude: number;
}

export async function searchCountries(query: string): Promise<Country[]> {
  const res = await fetch(`/api/countries?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getCities(countryCode: string): Promise<City[]> {
  const res = await fetch(`/api/cities?code=${encodeURIComponent(countryCode)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getCityDetails(
  city: string,
  country: string
): Promise<CityDetails | null> {
  const res = await fetch(
    `/api/city-details?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getAttractions(
  lat: number,
  lon: number,
  kind: string = "interesting_places"
): Promise<Attraction[]> {
  const res = await fetch(
    `/api/attractions?lat=${lat}&lon=${lon}&kind=${encodeURIComponent(kind)}`
  );
  if (!res.ok) return [];
  return res.json();
}
