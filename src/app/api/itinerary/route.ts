import { NextRequest, NextResponse } from "next/server";
import { CURATED_RESTAURANTS, type CuratedRestaurant } from "@/data/curated-restaurants";

const WIKI_HEADERS = { "User-Agent": "GardenLeaversTravelGuide/1.0" };
const WIKI_BASE = "https://en.wikipedia.org/w/api.php";

// ── Types ──────────────────────────────────────────────────────────

interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  category: "sightseeing" | "food" | "photo" | "travel" | "leisure" | "excursion";
  tip?: string;
  mapQuery?: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

interface FlightOption {
  id: string;
  airline: string;
  departure: string;
  departureCode: string;
  arrival: string;
  arrivalCode: string;
  outboundDepart: string;
  outboundArrive: string;
  returnDepart: string;
  returnArrive: string;
  duration: string;
  stops: number;
  stopCity?: string;
  price: number;
  currency: string;
  class: string;
  baggage: string;
  bookingUrl: string;
}

interface SightItem { name: string; category: string; description: string; views: number }
type MealType = "breakfast" | "lunch" | "dinner";
interface FoodItem { name: string; cuisine: string; description: string; address: string | null; openingHours: string | null; tier: "budget" | "mid_range" | "upscale" | "fine_dining"; type: "restaurant" | "cafe" | "bar" | "street_food" | "fine_dining"; meals: MealType[] }
interface PhotoItem { name: string; category: string; description: string }
interface ExcursionItem { name: string; type: string; description: string; duration: string }

// ── Main handler ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") || "";
  const country = request.nextUrl.searchParams.get("country") || "";
  const departureCity = request.nextUrl.searchParams.get("from") || "";
  const startDate = request.nextUrl.searchParams.get("startDate") || "";
  const days = parseInt(request.nextUrl.searchParams.get("days") || "5");
  const prefTime = request.nextUrl.searchParams.get("prefTime") || "morning";
  const cabinClass = request.nextUrl.searchParams.get("cabinClass") || "economy";

  if (!city || !country) {
    return NextResponse.json({ error: "City and country required" }, { status: 400 });
  }

  try {
    const coordRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", " + country)}&format=json&limit=1`,
      { headers: { "User-Agent": "HolidayPlannerApp/1.0" } }
    );
    let lat = 0, lon = 0;
    if (coordRes.ok) {
      const coordData = await coordRes.json();
      if (coordData.length > 0) {
        lat = parseFloat(coordData[0].lat);
        lon = parseFloat(coordData[0].lon);
      }
    }

    if (lat === 0 && lon === 0) {
      return NextResponse.json({ error: "Could not find city coordinates" }, { status: 404 });
    }

    // Fetch everything in parallel
    const [sights, food, photos, excursions] = await Promise.all([
      fetchSights(lat, lon, city),
      fetchFood(lat, lon, city, country),
      fetchPhotos(lat, lon, city),
      fetchExcursions(lat, lon, city, country),
    ]);

    const flights = generateFlightOptions(departureCity, city, country, startDate, days, prefTime, cabinClass, lat, lon);
    const itinerary = buildItinerary(city, country, sights, food, photos, excursions, flights[0], startDate, days);

    return NextResponse.json({ flights, itinerary, city, country });
  } catch (err) {
    console.error("Itinerary error:", err);
    return NextResponse.json({ error: "Failed to generate itinerary", detail: String(err) }, { status: 500 });
  }
}

// ── Flight options generator ───────────────────────────────────────

// Airport codes for common departure/arrival cities
const AIRPORT_CODES: Record<string, string> = {
  "london heathrow": "LHR", "london gatwick": "LGW", "london stansted": "STN",
  "london luton": "LTN", "london city": "LCY", "manchester": "MAN",
  "birmingham": "BHX", "edinburgh": "EDI", "glasgow": "GLA", "bristol": "BRS",
  "leeds bradford": "LBA", "liverpool john lennon": "LPL", "newcastle": "NCL",
  "belfast international": "BFS", "dublin": "DUB", "new york jfk": "JFK",
  "new york newark": "EWR", "los angeles lax": "LAX", "paris cdg": "CDG",
  "paris orly": "ORY", "amsterdam schiphol": "AMS", "frankfurt": "FRA",
  "munich": "MUC", "zurich": "ZRH", "madrid": "MAD", "lisbon": "LIS",
  "milan malpensa": "MXP", "rome fiumicino": "FCO", "athens": "ATH",
  "tokyo narita": "NRT", "tokyo haneda": "HND", "osaka kansai": "KIX",
  "bangkok": "BKK", "singapore changi": "SIN", "singapore": "SIN",
  "dubai": "DXB", "abu dhabi": "AUH", "doha": "DOH",
  "hong kong": "HKG", "sydney": "SYD", "melbourne": "MEL",
  "barcelona": "BCN", "istanbul": "IST", "seoul incheon": "ICN", "seoul": "ICN",
  "delhi": "DEL", "mumbai": "BOM", "cairo": "CAI", "cape town": "CPT",
  "sao paulo": "GRU", "rio de janeiro": "GIG", "mexico city": "MEX",
  "toronto": "YYZ", "vancouver": "YVR", "bali denpasar": "DPS", "bali": "DPS",
  "phuket": "HKT", "tokyo": "NRT", "rome": "FCO",
};

// region tags: EU = European, AS = Asia-Pacific, ME = Middle East, AM = Americas, AF = Africa
const AIRLINES = [
  // European flag carriers — fly worldwide
  { name: "British Airways", code: "BA", hub: "LHR", tier: "flag", region: "EU" },
  { name: "Lufthansa", code: "LH", hub: "FRA", tier: "flag", region: "EU" },
  { name: "Air France", code: "AF", hub: "CDG", tier: "flag", region: "EU" },
  { name: "KLM", code: "KL", hub: "AMS", tier: "flag", region: "EU" },
  { name: "Turkish Airlines", code: "TK", hub: "IST", tier: "flag", region: "EU" },
  { name: "Iberia", code: "IB", hub: "MAD", tier: "flag", region: "EU" },
  { name: "Swiss", code: "LX", hub: "ZRH", tier: "flag", region: "EU" },

  // European budget — SHORT-HAUL EUROPE ONLY
  { name: "Ryanair", code: "FR", hub: "STN", tier: "budget", region: "EU_SHORT" },
  { name: "easyJet", code: "U2", hub: "LGW", tier: "budget", region: "EU_SHORT" },
  { name: "Wizz Air", code: "W6", hub: "LTN", tier: "budget", region: "EU_SHORT" },
  { name: "Vueling", code: "VY", hub: "BCN", tier: "budget", region: "EU_SHORT" },

  // Middle East premium — fly worldwide, great for connections
  { name: "Emirates", code: "EK", hub: "DXB", tier: "premium", region: "ME" },
  { name: "Qatar Airways", code: "QR", hub: "DOH", tier: "premium", region: "ME" },
  { name: "Etihad Airways", code: "EY", hub: "AUH", tier: "premium", region: "ME" },

  // Asia-Pacific premium & flag carriers
  { name: "Cathay Pacific", code: "CX", hub: "HKG", tier: "premium", region: "AS" },
  { name: "Singapore Airlines", code: "SQ", hub: "SIN", tier: "premium", region: "AS" },
  { name: "Japan Airlines", code: "JL", hub: "NRT", tier: "premium", region: "AS" },
  { name: "ANA", code: "NH", hub: "NRT", tier: "premium", region: "AS" },
  { name: "Korean Air", code: "KE", hub: "ICN", tier: "flag", region: "AS" },
  { name: "Asiana Airlines", code: "OZ", hub: "ICN", tier: "flag", region: "AS" },
  { name: "Thai Airways", code: "TG", hub: "BKK", tier: "flag", region: "AS" },
  { name: "Vietnam Airlines", code: "VN", hub: "SGN", tier: "flag", region: "AS" },
  { name: "Malaysia Airlines", code: "MH", hub: "KUL", tier: "flag", region: "AS" },
  { name: "Garuda Indonesia", code: "GA", hub: "CGK", tier: "flag", region: "AS" },
  { name: "Philippine Airlines", code: "PR", hub: "MNL", tier: "flag", region: "AS" },
  { name: "EVA Air", code: "BR", hub: "TPE", tier: "premium", region: "AS" },
  { name: "China Airlines", code: "CI", hub: "TPE", tier: "flag", region: "AS" },
  { name: "Air China", code: "CA", hub: "PEK", tier: "flag", region: "AS" },
  { name: "Qantas", code: "QF", hub: "SYD", tier: "premium", region: "AS" },

  // Asia budget — REGIONAL SHORT-HAUL ONLY
  { name: "AirAsia", code: "AK", hub: "KUL", tier: "budget", region: "AS_SHORT" },
  { name: "Scoot", code: "TR", hub: "SIN", tier: "budget", region: "AS_SHORT" },
  { name: "Peach Aviation", code: "MM", hub: "KIX", tier: "budget", region: "AS_SHORT" },
  { name: "Jeju Air", code: "7C", hub: "ICN", tier: "budget", region: "AS_SHORT" },
  { name: "HK Express", code: "UO", hub: "HKG", tier: "budget", region: "AS_SHORT" },
  { name: "VietJet Air", code: "VJ", hub: "SGN", tier: "budget", region: "AS_SHORT" },
  { name: "Cebu Pacific", code: "5J", hub: "MNL", tier: "budget", region: "AS_SHORT" },

  // Americas
  { name: "American Airlines", code: "AA", hub: "DFW", tier: "flag", region: "AM" },
  { name: "Delta Air Lines", code: "DL", hub: "ATL", tier: "flag", region: "AM" },
  { name: "United Airlines", code: "UA", hub: "ORD", tier: "flag", region: "AM" },
  { name: "Air Canada", code: "AC", hub: "YYZ", tier: "flag", region: "AM" },
  { name: "LATAM Airlines", code: "LA", hub: "SCL", tier: "flag", region: "AM" },

  // Africa
  { name: "Ethiopian Airlines", code: "ET", hub: "ADD", tier: "flag", region: "AF" },
  { name: "South African Airways", code: "SA", hub: "JNB", tier: "flag", region: "AF" },
  { name: "Royal Air Maroc", code: "AT", hub: "CMN", tier: "flag", region: "AF" },
];

// Map airports to their region for route-aware airline selection
const AIRPORT_REGION: Record<string, string> = {
  // Europe
  LHR: "EU", LGW: "EU", STN: "EU", LTN: "EU", LCY: "EU", MAN: "EU", BHX: "EU",
  EDI: "EU", GLA: "EU", BRS: "EU", DUB: "EU", CDG: "EU", ORY: "EU", AMS: "EU",
  FRA: "EU", MUC: "EU", ZRH: "EU", MAD: "EU", LIS: "EU", MXP: "EU", FCO: "EU",
  ATH: "EU", BCN: "EU", IST: "EU",
  // Asia
  NRT: "AS", HND: "AS", KIX: "AS", BKK: "AS", SIN: "AS", HKG: "AS", ICN: "AS",
  DEL: "AS", BOM: "AS", DPS: "AS", HKT: "AS", KUL: "AS", SGN: "AS", CGK: "AS",
  MNL: "AS", TPE: "AS", PEK: "AS", SYD: "AS", MEL: "AS",
  // Middle East
  DXB: "ME", AUH: "ME", DOH: "ME",
  // Americas
  JFK: "AM", EWR: "AM", LAX: "AM", YYZ: "AM", YVR: "AM", GRU: "AM", GIG: "AM", MEX: "AM",
  // Africa
  CAI: "AF", CPT: "AF",
};

function getEligibleAirlines(fromCode: string, toCode: string, isShortHaul: boolean, isMediumHaul: boolean) {
  const fromRegion = AIRPORT_REGION[fromCode] || "EU";
  const toRegion = AIRPORT_REGION[toCode] || "EU";
  const sameRegion = fromRegion === toRegion;

  return AIRLINES.filter((a) => {
    // EU budget carriers: ONLY for short-haul flights within Europe
    if (a.region === "EU_SHORT") {
      return isShortHaul && fromRegion === "EU" && toRegion === "EU";
    }

    // Asian budget carriers: ONLY for short-haul flights within Asia
    if (a.region === "AS_SHORT") {
      return (isShortHaul || isMediumHaul) && fromRegion === "AS" && toRegion === "AS";
    }

    // Middle East carriers fly everywhere (great connectors)
    if (a.region === "ME") return true;

    // Flag carriers from the departure or arrival region are always relevant
    if (a.region === fromRegion || a.region === toRegion) return true;

    // For long-haul, also include major global carriers from other regions
    if (!isShortHaul && (a.tier === "premium" || a.tier === "flag")) {
      // But not regional carriers that don't fly this route
      // e.g. Ethiopian Airlines shouldn't show for HK→Seoul
      if (a.region === "AF" && fromRegion !== "AF" && toRegion !== "AF") return false;
      if (a.region === "AM" && fromRegion !== "AM" && toRegion !== "AM") return false;
      return true;
    }

    return false;
  });
}

const STOP_CITIES = ["Dubai", "Doha", "Istanbul", "Amsterdam", "Frankfurt", "Paris", "Singapore", "Abu Dhabi", "Zurich", "Madrid"];

function estimateFlightHours(fromLat: number, fromLon: number, toLat: number, toLon: number): number {
  const R = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLon = ((toLon - fromLon) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1.5, distKm / 800); // ~800 km/h average
}

// Rough coords for departure airports
const AIRPORT_COORDS: Record<string, [number, number]> = {
  LHR: [51.47, -0.46], LGW: [51.15, -0.19], STN: [51.89, 0.26], LTN: [51.87, -0.37],
  LCY: [51.50, 0.05], MAN: [53.35, -2.27], BHX: [52.45, -1.75], EDI: [55.95, -3.37],
  GLA: [55.87, -4.43], BRS: [51.38, -2.72], DUB: [53.42, -6.27],
  JFK: [40.64, -73.78], EWR: [40.69, -74.17], LAX: [33.94, -118.41],
  CDG: [49.01, 2.55], ORY: [48.72, 2.36], AMS: [52.31, 4.77], FRA: [50.03, 8.57],
  MUC: [48.35, 11.79], ZRH: [47.46, 8.55], MAD: [40.47, -3.56], LIS: [38.77, -9.13],
  MXP: [45.63, 8.72], FCO: [41.80, 12.25], ATH: [37.94, 23.94], BCN: [41.30, 2.08],
  IST: [41.26, 28.74], NRT: [35.76, 140.39], HND: [35.55, 139.78], KIX: [34.43, 135.23],
  BKK: [13.69, 100.75], SIN: [1.35, 103.99], DXB: [25.25, 55.36], AUH: [24.44, 54.65],
  DOH: [25.26, 51.61], HKG: [22.31, 113.91], SYD: [-33.95, 151.18], MEL: [-37.67, 144.84],
  ICN: [37.46, 126.44], DEL: [28.56, 77.10], BOM: [19.09, 72.87], CAI: [30.12, 31.40],
  CPT: [-33.96, 18.60], GRU: [-23.43, -46.47], GIG: [-22.81, -43.25], MEX: [19.44, -99.07],
  YYZ: [43.68, -79.63], YVR: [49.19, -123.18], DPS: [-8.75, 115.17], HKT: [8.11, 98.32],
  // Additional hubs for new airlines
  KUL: [2.75, 101.71], SGN: [10.82, 106.65], CGK: [-6.13, 106.66], MNL: [14.51, 121.02],
  TPE: [25.08, 121.23], PEK: [40.08, 116.58], DFW: [32.90, -97.04], ATL: [33.64, -84.43],
  ORD: [41.97, -87.91], SCL: [-33.39, -70.79], ADD: [8.98, 38.80], JNB: [-26.14, 28.25],
  CMN: [33.37, -7.59],
};

function resolveAirportCode(input: string): string {
  const key = input.toLowerCase().trim();
  return AIRPORT_CODES[key]
    || Object.entries(AIRPORT_CODES).find(([k]) => key.includes(k) || k.includes(key))?.[1]
    || input.slice(0, 3).toUpperCase();
}

// Cabin class display labels and multipliers
const CABIN_CLASSES: Record<string, { label: string; multiplier: number; baggage: string }> = {
  economy: { label: "Economy", multiplier: 1, baggage: "23kg checked + cabin" },
  premium_economy: { label: "Premium Economy", multiplier: 1.6, baggage: "2x 23kg checked + cabin" },
  business: { label: "Business", multiplier: 3.2, baggage: "2x 32kg checked + cabin" },
  first: { label: "First Class", multiplier: 5.5, baggage: "2x 32kg checked + cabin + amenity kit" },
};

function buildBookingUrl(fromCode: string, toCode: string, startDate: string, returnDate: string, cabinClass: string): string {
  // Google Flights deep link
  const cabinMap: Record<string, number> = { economy: 1, premium_economy: 2, business: 3, first: 4 };
  const cabin = cabinMap[cabinClass] || 1;
  return `https://www.google.com/travel/flights?q=flights+from+${fromCode}+to+${toCode}+on+${startDate}+return+${returnDate}&curr=GBP&tfs=CBoCJhIKMjAyNi0wNC0wMRoHCAESA${fromCode}KgcIARID${toCode}&tfu=${cabin}`;
}

function buildSkyscannerUrl(fromCode: string, toCode: string, startDate: string, returnDate: string, cabinClass: string): string {
  const cabinMap: Record<string, string> = { economy: "economy", premium_economy: "premiumeconomy", business: "business", first: "first" };
  const cabin = cabinMap[cabinClass] || "economy";
  const outDate = startDate.replace(/-/g, "").slice(2); // YYMMDD
  const retDate = returnDate.replace(/-/g, "").slice(2);
  return `https://www.skyscanner.net/transport/flights/${fromCode.toLowerCase()}/${toCode.toLowerCase()}/${outDate}/${retDate}/?adultsv2=1&cabinclass=${cabin}`;
}

function generateFlightOptions(
  from: string, toCity: string, toCountry: string,
  startDate: string, days: number, prefTime: string, cabinClass: string,
  destLat: number, destLon: number
): FlightOption[] {
  const fromCode = resolveAirportCode(from);
  const toCode = resolveAirportCode(toCity);

  const fromCoords = AIRPORT_COORDS[fromCode] || [51.47, -0.46];
  const flightHrs = estimateFlightHours(fromCoords[0], fromCoords[1], destLat, destLon);
  const isShortHaul = flightHrs < 4;
  const isMediumHaul = flightHrs >= 4 && flightHrs < 7;

  const seed = hashCode(from + toCity + startDate);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days - 1);
  const returnDateStr = endDate.toISOString().split("T")[0];

  // Base price estimation (economy)
  const basePrice = isShortHaul ? 80 + Math.abs(seed % 120) : isMediumHaul ? 200 + Math.abs(seed % 250) : 400 + Math.abs(seed % 500);
  const cabinInfo = CABIN_CLASSES[cabinClass] || CABIN_CLASSES.economy;

  // Generate more time slots for more flight options
  const timeSlots = [
    { depart: "06:00", label: "early" },
    { depart: "07:15", label: "early" },
    { depart: "08:45", label: "morning" },
    { depart: "10:10", label: "morning" },
    { depart: "11:30", label: "midday" },
    { depart: "13:00", label: "afternoon" },
    { depart: "14:20", label: "afternoon" },
    { depart: "15:45", label: "afternoon" },
    { depart: "17:30", label: "evening" },
    { depart: "19:45", label: "evening" },
    { depart: "21:15", label: "evening" },
    { depart: "23:00", label: "evening" },
  ];

  // Filter & rank airlines for this route
  const eligible = getEligibleAirlines(fromCode, toCode, isShortHaul, isMediumHaul);

  // Score airlines by route relevance — hub carriers MUST appear prominently
  const scored = eligible.map((a) => {
    let score = 0;
    // Airline is based at the destination airport (e.g. Cathay for HKG, SQ for SIN)
    if (a.hub === toCode) score += 500;
    // Airline is based at the departure airport (e.g. BA for LHR)
    if (a.hub === fromCode) score += 400;
    // Premium carriers get a boost
    if (a.tier === "premium") score += 50;
    if (a.tier === "flag") score += 30;
    // Airlines from the destination region
    if (a.region === AIRPORT_REGION[toCode]) score += 80;
    // Airlines from the departure region
    if (a.region === AIRPORT_REGION[fromCode]) score += 60;
    // Middle East connectors are always good options
    if (a.region === "ME") score += 40;
    // Small hash jitter for variety, but never enough to override relevance
    score += Math.abs(hashCode(a.name + toCity)) % 20;
    return { airline: a, score };
  });
  const shuffled = scored.sort((a, b) => b.score - a.score).map((s) => s.airline);

  if (shuffled.length === 0) return [];

  const options: FlightOption[] = timeSlots.map((slot, i) => {
    const airline = shuffled[i % shuffled.length];

    // Mix of direct and transit — short-haul mostly direct, long-haul mix
    const isDirect = isShortHaul
      ? (i % 5 !== 4)    // 80% direct for short-haul
      : isMediumHaul
        ? (i % 3 !== 2)  // 67% direct for medium-haul
        : (i % 2 === 0); // 50% direct for long-haul
    const stops = isDirect ? 0 : 1;

    // Layover time: 1.5-4h with seed-based consistency
    const layoverHrs = stops > 0 ? 1.5 + (Math.abs(hashCode(airline.name + slot.depart + "lay")) % 25) / 10 : 0;
    const totalHrs = flightHrs + layoverHrs;

    // Calculate arrival time
    const [depH, depM] = slot.depart.split(":").map(Number);
    const arrH = Math.floor(depH + totalHrs) % 24;
    const arrM = (depM + Math.floor((totalHrs % 1) * 60)) % 60;
    const arriveTime = `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}`;

    // Duration string
    const dHrs = Math.floor(totalHrs);
    const dMins = Math.round((totalHrs % 1) * 60);
    const duration = `${dHrs}h ${dMins}m`;

    // Return flight — seed-based for consistency
    const retDepH = 8 + (Math.abs(hashCode(airline.name + "ret" + i)) % 13); // 8am-9pm
    const retDepM = Math.abs(hashCode(airline.name + "retm" + i)) % 60;
    const retArrH = Math.floor(retDepH + totalHrs) % 24;
    const retArrM = (retDepM + Math.floor((totalHrs % 1) * 60)) % 60;
    const returnDepart = `${String(retDepH).padStart(2, "0")}:${String(retDepM).padStart(2, "0")}`;
    const returnArrive = `${String(retArrH).padStart(2, "0")}:${String(retArrM).padStart(2, "0")}`;

    // Price calculation
    let price = basePrice;
    if (slot.label === "early") price = Math.round(price * 0.75);
    if (slot.label === "evening") price = Math.round(price * 0.88);
    if (slot.label === "morning") price = Math.round(price * 1.1);
    if (airline.tier === "budget") price = Math.round(price * 0.55);
    if (airline.tier === "premium") price = Math.round(price * 1.35);
    if (stops > 0) price = Math.round(price * 0.78);

    // Apply cabin class multiplier
    price = Math.round(price * cabinInfo.multiplier);

    // Seed-based jitter for uniqueness
    price += Math.abs(hashCode(airline.name + slot.depart + cabinClass)) % 60 - 30;
    price = Math.max(25, price);

    const stopCity = stops > 0 ? STOP_CITIES[Math.abs(hashCode(airline.name + toCity + i)) % STOP_CITIES.length] : undefined;

    // Budget airlines don't offer premium cabins — force economy
    const effectiveClass = (airline.tier === "budget" && cabinClass !== "economy") ? "economy" : cabinClass;
    const effectiveCabinInfo = CABIN_CLASSES[effectiveClass] || CABIN_CLASSES.economy;

    // Baggage depends on airline tier + cabin
    let baggage = effectiveCabinInfo.baggage;
    if (airline.tier === "budget" && effectiveClass === "economy") baggage = "Cabin bag only (checked bag extra)";

    return {
      id: `${airline.code}-${i}`,
      airline: airline.name,
      departure: from || "London Heathrow",
      departureCode: fromCode,
      arrival: `${toCity}, ${toCountry}`,
      arrivalCode: toCode,
      outboundDepart: slot.depart,
      outboundArrive: arriveTime,
      returnDepart,
      returnArrive,
      duration,
      stops,
      stopCity,
      price,
      currency: "GBP",
      class: effectiveCabinInfo.label,
      baggage,
      bookingUrl: buildSkyscannerUrl(fromCode, toCode, startDate, returnDateStr, effectiveClass),
    };
  });

  // Sort by price
  options.sort((a, b) => a.price - b.price);
  return options;
}

// ── Itinerary builder ──────────────────────────────────────────────

// Classify sights by how long they realistically take
const FULL_DAY_KEYWORDS = /disneyland|disney|theme park|water park|universal studios|legoland|sea world|ocean park|national park|safari|island hopping|amusement/i;
const HALF_DAY_KEYWORDS = /museum|gallery|palace|castle|temple complex|zoo|aquarium|botanical garden|historic district|old town|ancient|ruins|cathedral|basilica|fortress|citadel/i;

type SightDuration = "full_day" | "half_day" | "short";

function classifySightDuration(name: string, description: string): SightDuration {
  const text = name + " " + description;
  if (FULL_DAY_KEYWORDS.test(text)) return "full_day";
  if (HALF_DAY_KEYWORDS.test(text)) return "half_day";
  return "short";
}

function buildItinerary(
  city: string, country: string,
  sights: SightItem[], food: FoodItem[], photos: PhotoItem[], excursions: ExcursionItem[],
  selectedFlight: FlightOption,
  startDate: string, days: number
): ItineraryDay[] {
  const itinerary: ItineraryDay[] = [];

  // Classify sights by duration
  const classifiedSights = sights.map((s) => ({
    ...s,
    duration: classifySightDuration(s.name, s.description),
  }));

  const fullDaySights = classifiedSights.filter((s) => s.duration === "full_day");
  const halfDaySights = classifiedSights.filter((s) => s.duration === "half_day");
  const shortSights = classifiedSights.filter((s) => s.duration === "short");

  // Track usage
  let fullDayIdx = 0;
  let halfDayIdx = 0;
  let shortIdx = 0;
  let photoIdx = 0;
  let excursionIdx = 0;

  const nextFullDay = () => fullDayIdx < fullDaySights.length ? fullDaySights[fullDayIdx++] : null;
  const nextHalfDay = () => halfDayIdx < halfDaySights.length ? halfDaySights[halfDayIdx++] : null;
  const nextShort = () => shortIdx < shortSights.length ? shortSights[shortIdx++] : null;
  const nextPhoto = () => photoIdx < photos.length ? photos[photoIdx++] : null;
  const nextExcursion = () => excursionIdx < excursions.length ? excursions[excursionIdx++] : null;

  // Food helpers — meal-aware selection
  type TierKey = "budget" | "mid_range" | "upscale" | "fine_dining";

  // Pre-filter food by meal type AND tier for efficient lookup
  const foodByMealAndTier: Record<MealType, Record<TierKey, FoodItem[]>> = {
    breakfast: { budget: [], mid_range: [], upscale: [], fine_dining: [] },
    lunch: { budget: [], mid_range: [], upscale: [], fine_dining: [] },
    dinner: { budget: [], mid_range: [], upscale: [], fine_dining: [] },
  };
  for (const f of food) {
    for (const meal of f.meals) {
      foodByMealAndTier[meal][f.tier].push(f);
    }
  }

  // Track which restaurants have been used to avoid repeats within the trip
  const usedFoodNames = new Set<string>();

  const nextFoodForMeal = (meal: MealType, tier: TierKey): FoodItem | null => {
    const mealTiers = foodByMealAndTier[meal];
    // Try requested tier first
    const primary = mealTiers[tier].filter((f) => !usedFoodNames.has(f.name));
    if (primary.length > 0) {
      const pick = primary[0];
      usedFoodNames.add(pick.name);
      return pick;
    }
    // Fallback through other tiers, still meal-filtered
    const fallbacks: TierKey[] = meal === "breakfast"
      ? ["budget", "mid_range", "upscale"]
      : ["mid_range", "upscale", "budget", "fine_dining"];
    for (const fb of fallbacks) {
      if (fb === tier) continue;
      const arr = mealTiers[fb].filter((f) => !usedFoodNames.has(f.name));
      if (arr.length > 0) {
        const pick = arr[0];
        usedFoodNames.add(pick.name);
        return pick;
      }
    }
    // Last resort: any unused food of the right tier (ignore meal filter)
    const anyTier = food.filter((f) => f.tier === tier && !usedFoodNames.has(f.name));
    if (anyTier.length > 0) {
      const pick = anyTier[0];
      usedFoodNames.add(pick.name);
      return pick;
    }
    return null;
  };

  // Legacy wrapper for code that doesn't specify meal — defaults to dinner
  const nextFoodByTier = (tier: TierKey): FoodItem | null => nextFoodForMeal("dinner", tier);

  const dinnerTierRotation: TierKey[] = ["mid_range", "upscale", "mid_range", "fine_dining", "upscale", "mid_range"];

  const TIER_LABELS: Record<string, string> = {
    budget: "Budget Eats", mid_range: "Mid-Range", upscale: "Upscale", fine_dining: "Fine Dining",
  };

  const makeFoodActivity = (label: string, food: FoodItem | null, time: string, extraDesc?: string): ItineraryActivity | null => {
    if (!food) return null;
    return {
      time,
      title: `${label}: ${food.name}`,
      description: extraDesc ? `${extraDesc} ${food.description || food.cuisine}` : food.description || `${food.cuisine} cuisine.`,
      category: "food",
      tip: `${TIER_LABELS[food.tier]}. ${food.address ? `Location: ${food.address}.` : ""}`.trim(),
      mapQuery: `${food.name} ${city}`,
    };
  };

  // ── Plan day types ──
  // Decide what kind of day each day is, accounting for full-day and half-day sights
  type DayType = "arrival" | "departure" | "full_day_sight" | "excursion" | "half_day_pair" | "sightseeing";
  const dayPlan: DayType[] = [];

  for (let d = 0; d < days; d++) {
    if (d === 0) { dayPlan.push("arrival"); continue; }
    if (d === days - 1) { dayPlan.push("departure"); continue; }

    // Every 3rd day is excursion (if we have excursions)
    if (d % 3 === 2 && excursionIdx < excursions.length) {
      dayPlan.push("excursion");
      continue;
    }

    // If we have full-day sights, dedicate a day to them
    if (fullDayIdx < fullDaySights.length) {
      dayPlan.push("full_day_sight");
      continue;
    }

    // If we have half-day sights, pair two together or pair with short sights
    if (halfDayIdx < halfDaySights.length) {
      dayPlan.push("half_day_pair");
      continue;
    }

    dayPlan.push("sightseeing");
  }

  // Reset indices after planning
  fullDayIdx = 0;
  halfDayIdx = 0;
  shortIdx = 0;
  excursionIdx = 0;

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const activities: ItineraryActivity[] = [];
    const type = dayPlan[d];

    // ── ARRIVAL DAY ──
    if (type === "arrival") {
      activities.push({
        time: selectedFlight.outboundDepart,
        title: `Depart from ${selectedFlight.departure}`,
        description: `Board your ${selectedFlight.airline} flight. ${selectedFlight.stops > 0 ? `Connecting via ${selectedFlight.stopCity}.` : "Direct flight."} Flight time: ${selectedFlight.duration}.`,
        category: "travel",
        tip: "Arrive at the airport at least 2 hours before departure. Check in online the night before.",
      });
      activities.push({
        time: selectedFlight.outboundArrive,
        title: `Arrive in ${city}`,
        description: `Welcome to ${city}! Collect your bags and make your way to your accommodation. Take some time to freshen up and settle in.`,
        category: "travel",
        tip: "Pre-book airport transfers. Check if the city has an airport express train — often cheaper and faster than taxis.",
      });

      // Only schedule activities if arriving early enough
      const arriveHour = parseInt(selectedFlight.outboundArrive.split(":")[0]);

      if (arriveHour <= 14) {
        // Early arrival — afternoon sightseeing + dinner
        const firstSight = nextShort();
        if (firstSight) {
          activities.push({
            time: "16:30",
            title: `First Look: ${firstSight.name}`,
            description: `Ease into your trip with a gentle stroll to ${firstSight.name}. ${firstSight.description || `Get your bearings and soak in the atmosphere of ${city}.`}`,
            category: "sightseeing",
            tip: "Keep it relaxed — save your energy for the days ahead. Just enjoy being here.",
            mapQuery: `${firstSight.name} ${city}`,
          });
        }
        const dinner = nextFoodForMeal("dinner", "upscale");
        const act = makeFoodActivity("Welcome Dinner", dinner, "19:30", `Celebrate arriving in ${city}.`);
        if (act) activities.push(act);
      } else if (arriveHour <= 18) {
        // Late afternoon arrival — just dinner
        const dinner = nextFoodForMeal("dinner", "upscale");
        const act = makeFoodActivity("Welcome Dinner", dinner, "20:30", `Celebrate arriving in ${city}. Head out for a late first meal.`);
        if (act) activities.push(act);
      } else {
        // Late night arrival — just rest
        activities.push({
          time: `${Math.min(arriveHour + 1, 23)}:30`,
          title: "Check In & Rest",
          description: `Late arrival — head straight to your accommodation and get some rest. ${city} awaits you tomorrow!`,
          category: "leisure",
          tip: "Grab a snack from a convenience store or night market near your hotel if you're hungry.",
        });
      }
    }

    // ── DEPARTURE DAY ──
    else if (type === "departure") {
      // Breakfast before anything else
      const bfast = nextFoodForMeal("breakfast", "budget");
      const bfastAct = makeFoodActivity("Breakfast", bfast, "07:30", "Last morning — fuel up before your final day.");
      if (bfastAct) activities.push(bfastAct);

      const photo = nextPhoto();
      if (photo) {
        activities.push({
          time: "08:30",
          title: `Morning Photos: ${photo.name}`,
          description: `Last chance for photos! ${photo.description || `Capture your favourite spot in ${city} one final time.`}`,
          category: "photo",
          tip: "Pack your bags before heading out. Leave luggage at the hotel if possible.",
          mapQuery: `${photo.name} ${city}`,
        });
      }

      const sight = nextShort();
      if (sight) {
        activities.push({
          time: "10:00",
          title: `Final Visit: ${sight.name}`,
          description: sight.description || `Squeeze in one last attraction before heading home.`,
          category: "sightseeing",
          mapQuery: `${sight.name} ${city}`,
        });
      }

      const lunch = nextFoodForMeal("lunch", "fine_dining");
      const lunchAct = makeFoodActivity("Farewell Lunch", lunch, "12:00", `One last incredible meal in ${city}.`);
      if (lunchAct) activities.push(lunchAct);

      activities.push({
        time: "14:30",
        title: "Head to Airport",
        description: `Allow plenty of time to get to the airport, check in, and do any last-minute duty-free shopping.`,
        category: "travel",
        tip: "Keep receipts for tax refund claims at the airport!",
      });
      activities.push({
        time: selectedFlight.returnDepart,
        title: `Fly Home — ${selectedFlight.airline}`,
        description: `Board your return flight. ${selectedFlight.stops > 0 ? `Connecting via ${selectedFlight.stopCity}.` : "Direct flight."} What an incredible trip!`,
        category: "travel",
      });
    }

    // ── FULL-DAY SIGHT (theme park, national park, island trip) ──
    else if (type === "full_day_sight") {
      const sight = nextFullDay();
      if (sight) {
        // Quick breakfast nearby before heading out
        const bfast = nextFoodForMeal("breakfast", "budget");
        const bfastAct = makeFoodActivity("Breakfast", bfast, "08:00", "Quick fuel-up before your big day.");
        if (bfastAct) activities.push(bfastAct);

        activities.push({
          time: "09:30",
          title: sight.name,
          description: `${sight.description || `Spend the day exploring ${sight.name}.`} This is a full-day attraction — take your time and make the most of it.`,
          category: "sightseeing",
          tip: "Full day visit. Bring water, sunscreen, and comfortable shoes. Consider buying skip-the-line tickets online.",
          mapQuery: `${sight.name} ${city}`,
        });

        activities.push({
          time: "12:30",
          title: "Lunch Break",
          description: `Grab lunch inside or near ${sight.name}. Most major attractions have food options — or pack something from a nearby bakery.`,
          category: "food",
          tip: "Mid-Range. Eat inside the venue or at a nearby restaurant — no need to rush back across town.",
        });

        activities.push({
          time: "13:30",
          title: `Continue Exploring ${sight.name}`,
          description: "Afternoon at the attraction — catch anything you missed in the morning, try different areas or rides.",
          category: "sightseeing",
          mapQuery: `${sight.name} ${city}`,
        });

        // Late afternoon departure, dinner nearby
        const dinner = nextFoodForMeal("dinner", "mid_range");
        const dinnerAct = makeFoodActivity("Dinner", dinner, "18:30", `Unwind after your full day at ${sight.name}.`);
        if (dinnerAct) activities.push(dinnerAct);

        activities.push({
          time: "20:30",
          title: "Evening Rest",
          description: "You've had a big day — put your feet up, or take a gentle evening stroll near your hotel.",
          category: "leisure",
        });
      }
    }

    // ── EXCURSION DAY ──
    else if (type === "excursion") {
      const exc = nextExcursion();
      const bfast = nextFoodForMeal("breakfast", "budget");
      const bfastAct = makeFoodActivity("Breakfast", bfast, "08:00", "Fuel up for your adventure.");
      if (bfastAct) activities.push(bfastAct);

      if (exc) {
        const isFullDay = /full day/i.test(exc.duration);
        const isHalfDay = /half day/i.test(exc.duration);

        activities.push({
          time: "09:30",
          title: `Excursion: ${exc.name}`,
          description: exc.description,
          category: "excursion",
          tip: `Duration: ${exc.duration}. Wear comfortable clothes and bring water & sun protection.`,
          mapQuery: `${exc.name} ${city} ${country}`,
        });

        if (isFullDay) {
          activities.push({
            time: "13:00",
            title: "Lunch During Excursion",
            description: "Most full-day excursions include lunch or stop somewhere local for a meal. Ask your guide for recommendations.",
            category: "food",
            tip: "Mid-Range. Eat where the locals eat — your guide will know the best spots.",
          });

          activities.push({
            time: "17:00",
            title: "Return from Excursion",
            description: `Head back to ${city} and freshen up at your accommodation.`,
            category: "travel",
          });
        } else {
          // Half-day or shorter — afternoon free for a second activity
          const exc2 = nextExcursion();
          if (exc2 && exc2.name !== exc.name && !isHalfDay) {
            activities.push({
              time: "14:00",
              title: `Afternoon: ${exc2.name}`,
              description: exc2.description,
              category: "excursion",
              tip: `Duration: ${exc2.duration}`,
              mapQuery: `${exc2.name} ${city} ${country}`,
            });
          } else {
            // Use afternoon for a nearby sight + photo
            const sight = nextShort();
            if (sight) {
              activities.push({
                time: "15:00",
                title: sight.name,
                description: sight.description || `Explore ${sight.name} at a relaxed pace.`,
                category: "sightseeing",
                mapQuery: `${sight.name} ${city}`,
              });
            }
            const photo = nextPhoto();
            if (photo) {
              activities.push({
                time: "16:30",
                title: `Photo Stop: ${photo.name}`,
                description: photo.description || `Great golden-hour photo opportunity at ${photo.name}.`,
                category: "photo",
                mapQuery: `${photo.name} ${city}`,
              });
            }
          }
        }

        const dinner = nextFoodForMeal("dinner", "upscale");
        const dinnerAct = makeFoodActivity("Dinner", dinner, "19:30", `You've earned a great meal after today's adventure!`);
        if (dinnerAct) activities.push(dinnerAct);

        activities.push({
          time: "21:00",
          title: "Evening at Leisure",
          description: `Rest up or explore ${city}'s nightlife — rooftop bars, night markets, or a late-night food crawl.`,
          category: "leisure",
        });
      }
    }

    // ── HALF-DAY PAIR (museum morning + different area afternoon) ──
    else if (type === "half_day_pair") {
      const bfast = nextFoodForMeal("breakfast", "budget");
      const bfastAct = makeFoodActivity("Breakfast", bfast, "08:30");
      if (bfastAct) activities.push(bfastAct);

      const morning = nextHalfDay();
      if (morning) {
        activities.push({
          time: "09:30",
          title: morning.name,
          description: `${morning.description || `Explore ${morning.name}.`} Allow 2-3 hours to see everything properly.`,
          category: "sightseeing",
          tip: "Half-day attraction. Don't rush — give yourself time to really take it in.",
          mapQuery: `${morning.name} ${city}`,
        });
      }

      // Lunch nearby the morning attraction
      const lunch = nextFoodForMeal("lunch", "mid_range");
      const lunchAct = makeFoodActivity("Lunch", lunch, "12:30", morning ? `Grab lunch near ${morning.name}.` : "");
      if (lunchAct) activities.push(lunchAct);

      // Afternoon: second half-day sight, or cluster of short sights
      const afternoon = nextHalfDay() || nextShort();
      if (afternoon) {
        activities.push({
          time: "14:30",
          title: afternoon.name,
          description: afternoon.description || `Afternoon exploring ${afternoon.name}.`,
          category: "sightseeing",
          mapQuery: `${afternoon.name} ${city}`,
        });
      }

      // Quick short sight or photo if time allows
      const extra = nextShort();
      if (extra) {
        activities.push({
          time: "16:30",
          title: extra.name,
          description: extra.description || `Quick visit to ${extra.name} while you're in the area.`,
          category: "sightseeing",
          mapQuery: `${extra.name} ${city}`,
        });
      } else {
        const photo = nextPhoto();
        if (photo) {
          activities.push({
            time: "16:30",
            title: `Golden Hour: ${photo.name}`,
            description: photo.description || `Beautiful late-afternoon light at ${photo.name}.`,
            category: "photo",
            mapQuery: `${photo.name} ${city}`,
          });
        }
      }

      const dinnerTier = dinnerTierRotation[(d - 1) % dinnerTierRotation.length];
      const dinner = nextFoodForMeal("dinner", dinnerTier);
      const dinnerAct = makeFoodActivity(dinner?.tier === "fine_dining" || dinner?.tier === "upscale" ? "Special Dinner" : "Dinner", dinner, "19:30");
      if (dinnerAct) activities.push(dinnerAct);

      activities.push({
        time: "21:00",
        title: "Evening Free Time",
        description: `Explore ${city} at night — rooftop bars, live music, night markets, or a relaxing stroll.`,
        category: "leisure",
      });
    }

    // ── REGULAR SIGHTSEEING DAY (cluster of short sights) ──
    else {
      const bfast = nextFoodForMeal("breakfast", "budget");
      if (bfast && bfast.type !== "bar") {
        const bfastAct = makeFoodActivity("Breakfast", bfast, "08:30");
        if (bfastAct) activities.push(bfastAct);
      }

      // Morning: two short sights
      const morning1 = nextShort() || nextHalfDay();
      if (morning1) {
        activities.push({
          time: "09:30",
          title: morning1.name,
          description: morning1.description || `Visit ${morning1.name}, one of ${city}'s highlights.`,
          category: "sightseeing",
          tip: "Arrive early to beat the crowds.",
          mapQuery: `${morning1.name} ${city}`,
        });
      }

      const morning2 = nextShort();
      if (morning2) {
        activities.push({
          time: "11:00",
          title: morning2.name,
          description: morning2.description || `Walk over to nearby ${morning2.name}.`,
          category: "sightseeing",
          mapQuery: `${morning2.name} ${city}`,
        });
      }

      const lunch = nextFoodForMeal("lunch", "mid_range");
      const lunchAct = makeFoodActivity("Lunch", lunch, "12:30");
      if (lunchAct) activities.push(lunchAct);

      // Afternoon: one or two sights + photo
      const afternoon1 = nextShort();
      if (afternoon1) {
        activities.push({
          time: "14:30",
          title: afternoon1.name,
          description: afternoon1.description || `Afternoon visit to ${afternoon1.name}.`,
          category: "sightseeing",
          mapQuery: `${afternoon1.name} ${city}`,
        });
      }

      const photo = nextPhoto();
      if (photo) {
        activities.push({
          time: "16:30",
          title: `Golden Hour: ${photo.name}`,
          description: photo.description || `Capture stunning late-afternoon photos at ${photo.name}.`,
          category: "photo",
          tip: "Golden hour lighting makes everything look incredible.",
          mapQuery: `${photo.name} ${city}`,
        });
      }

      const dinnerTier = dinnerTierRotation[(d - 1) % dinnerTierRotation.length];
      const dinner = nextFoodForMeal("dinner", dinnerTier);
      const isSpecial = dinner?.tier === "fine_dining" || dinner?.tier === "upscale";
      const dinnerAct = makeFoodActivity(isSpecial ? "Special Dinner" : "Dinner", dinner, "19:30",
        isSpecial ? "Tonight's a treat!" : "");
      if (dinnerAct) activities.push(dinnerAct);

      activities.push({
        time: "21:00",
        title: "Evening Free Time",
        description: `Explore ${city} at night — rooftop bars, live music, night markets, or a relaxing stroll.`,
        category: "leisure",
      });
    }

    activities.sort((a, b) => a.time.localeCompare(b.time));

    // Smart theme based on day type
    const themeMap: Record<DayType, string> = {
      arrival: "Arrival & First Impressions",
      departure: "Farewell Day",
      full_day_sight: activities.find((a) => a.category === "sightseeing")?.title || "Full-Day Adventure",
      excursion: "Excursion & Adventure",
      half_day_pair: "Culture & Exploration",
      sightseeing: "Iconic Landmarks & Local Flavours",
    };
    const dayThemes = ["Iconic Landmarks", "Culture & History", "Local Flavours & Hidden Gems", "Nature & Scenic Views", "Markets & Street Food", "Neighbourhood Deep Dive", "Art & Architecture", "Off the Beaten Path"];

    let theme = themeMap[type];
    if (type === "sightseeing" || type === "half_day_pair") {
      theme = dayThemes[(d - 1) % dayThemes.length];
    }
    if (type === "full_day_sight") {
      const mainSight = activities.find((a) => a.category === "sightseeing");
      if (mainSight) theme = mainSight.title;
    }

    itinerary.push({
      day: d + 1,
      date: dateStr,
      theme,
      activities,
    });
  }

  return itinerary;
}

// ── Data fetchers ──────────────────────────────────────────────────

async function fetchSights(lat: number, lon: number, city: string): Promise<SightItem[]> {
  try {
    const citySlug = city.replace(/ /g, "_");

    const [geoResults, categoryResults, subCatResults, searchResults] = await Promise.all([
      fetchJson(
        `${WIKI_BASE}?action=query&list=geosearch&gsradius=10000&gscoord=${lat}|${lon}&gslimit=50&format=json`
      ).then((d) => (d?.query?.geosearch || []).map((a: { title: string }) => a.title)),

      Promise.all([
        fetchCategoryMembers(`Tourist_attractions_in_${citySlug}`, 40),
        fetchCategoryMembers(`Visitor_attractions_in_${citySlug}`, 40),
      ]).then((a) => a.flat()),

      Promise.all(
        ["Landmarks", "Museums", "Parks", "Towers", "Bridges", "Churches", "Cathedrals",
         "Palaces", "Castles", "Monuments_and_memorials", "Squares", "Gardens",
         "Beaches", "Markets", "Temples", "Shrines", "Shopping_malls",
         "Amusement_parks", "Theme_parks", "Zoos", "Aquariums",
        ].map((t) => fetchCategoryMembers(`${t}_in_${citySlug}`, 15))
      ).then((a) => a.flat()),

      Promise.all([
        `${city} tourist attraction landmark must visit`,
        `${city} museum gallery exhibition`,
        `${city} temple church mosque cathedral`,
        `${city} market shopping district`,
        `${city} famous place popular destination`,
        `${city} park garden nature`,
        `${city} monument statue memorial`,
        `${city} theme park amusement`,
      ].map((q) =>
        fetchJson(
          `${WIKI_BASE}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=0&srlimit=10&format=json`
        ).then((d) => (d?.query?.search || []).map((s: { title: string }) => s.title))
      )).then((a) => a.flat()),
    ]);

    const allTitles = [...new Set([...geoResults, ...categoryResults, ...subCatResults, ...searchResults])];
    const filtered = allTitles.filter((t) => {
      if (t.toLowerCase() === city.toLowerCase()) return false;
      if (/^(list|history|tourism|culture|geography|transport|demographics|politics|economy|climate|education) (of|in)/i.test(t)) return false;
      if (/\(film\)|\(band\)|\(novel\)|\(album\)|\(TV\)|\(company\)|\(disambiguation\)|\(song\)/i.test(t)) return false;
      if (/airport|university|hospital|prison|college|school/i.test(t)) return false;
      if (/football|cricket|rugby|league|championship/i.test(t)) return false;
      return true;
    });

    if (filtered.length === 0) return [];

    // Fetch in batches of 20
    const allPages: Record<string, unknown>[] = [];
    for (let i = 0; i < Math.min(filtered.length, 60); i += 20) {
      const batch = filtered.slice(i, i + 20);
      const data = await fetchJsonPost(
        WIKI_BASE,
        `action=query&titles=${encodeURIComponent(batch.join("|"))}&prop=pageviews|description&pvipdays=30&format=json`
      );
      if (data?.query?.pages) {
        allPages.push(...Object.values(data.query.pages) as Record<string, unknown>[]);
      }
    }

    return allPages
      .filter((p) => {
        if ((p as { missing?: boolean }).missing) return false;
        const desc = ((p as { description?: string }).description || "").toLowerCase();
        if (/person|born \d|died \d|film|album|song|company|war|battle|football|university|airport|municipality|province|prefecture/i.test(desc)) return false;
        return true;
      })
      .map((p) => {
        const page = p as { title: string; description?: string; pageviews?: Record<string, number | null> };
        const views = Object.values(page.pageviews || {}).reduce((s: number, v) => s + (v || 0), 0);
        const desc = page.description || "";
        const combined = (desc + " " + page.title).toLowerCase();
        let category = "Attraction";
        if (/museum|gallery|exhibition/i.test(combined)) category = "Museum";
        else if (/temple|shrine|church|cathedral|mosque|chapel|basilica/i.test(combined)) category = "Temple / Church";
        else if (/palace|castle|château|fortress/i.test(combined)) category = "Palace";
        else if (/park|garden|botanical/i.test(combined)) category = "Park & Garden";
        else if (/tower|bridge|monument|statue|memorial/i.test(combined)) category = "Landmark";
        else if (/market|shopping|mall|bazaar/i.test(combined)) category = "Shopping";
        else if (/beach|bay|coast/i.test(combined)) category = "Beach";
        else if (/zoo|aquarium|wildlife/i.test(combined)) category = "Zoo & Aquarium";
        else if (/theme park|amusement/i.test(combined)) category = "Theme Park";
        return { name: page.title, category, description: desc, views };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 40); // enough for 14-day trips (3 sights/day)
  } catch {
    return [];
  }
}

// Regional cuisine map — what food is actually LOCAL to each country/region
// Used to heavily boost authentic local restaurants and penalise out-of-place Western food
const REGIONAL_CUISINES: Record<string, string[]> = {
  // East Asia
  "hong kong": ["cantonese", "chinese", "dim_sum", "congee", "noodle", "wonton", "char_siu", "roast_goose", "seafood", "cha_chaan_teng", "hong_kong", "yum_cha", "hotpot", "tea", "asian", "sichuan", "shanghainese", "japanese", "korean", "vietnamese", "thai", "malaysian", "singaporean", "taiwanese"],
  "china": ["chinese", "cantonese", "sichuan", "szechuan", "hunan", "shanghai", "beijing", "dim_sum", "dumpling", "noodle", "hotpot", "peking", "wonton", "congee", "asian"],
  "japan": ["japanese", "sushi", "ramen", "izakaya", "tempura", "yakitori", "udon", "soba", "tonkatsu", "kaiseki", "okonomiyaki", "teppanyaki", "gyudon", "donburi", "takoyaki", "asian"],
  "south korea": ["korean", "bbq", "bibimbap", "kimchi", "bulgogi", "jjigae", "samgyeopsal", "tteokbokki", "fried_chicken", "pojangmacha", "asian"],
  "korea": ["korean", "bbq", "bibimbap", "kimchi", "bulgogi", "jjigae", "samgyeopsal", "tteokbokki", "fried_chicken", "pojangmacha", "asian"],
  "taiwan": ["taiwanese", "chinese", "bubble_tea", "beef_noodle", "dumpling", "night_market", "hotpot", "bao", "asian"],

  // Southeast Asia
  "thailand": ["thai", "pad_thai", "curry", "tom_yum", "som_tum", "sticky_rice", "street_food", "noodle", "seafood", "isaan", "asian"],
  "vietnam": ["vietnamese", "pho", "banh_mi", "bun_cha", "spring_roll", "noodle", "seafood", "com", "asian"],
  "singapore": ["singaporean", "chinese", "malay", "indian", "hawker", "laksa", "chicken_rice", "chilli_crab", "satay", "noodle", "roti", "asian"],
  "malaysia": ["malaysian", "malay", "chinese", "indian", "nasi_lemak", "roti", "laksa", "satay", "char_kway_teow", "noodle", "asian"],
  "indonesia": ["indonesian", "nasi_goreng", "satay", "rendang", "soto", "padang", "javanese", "balinese", "seafood", "asian"],
  "philippines": ["filipino", "adobo", "sinigang", "lechon", "sisig", "kare_kare", "seafood", "asian"],

  // South Asia
  "india": ["indian", "curry", "tandoori", "biryani", "thali", "dosa", "chaat", "mughlai", "south_indian", "north_indian", "punjabi", "bengali", "gujarati", "rajasthani", "kerala", "goan", "vegetarian"],
  "sri lanka": ["sri_lankan", "curry", "rice_and_curry", "hopper", "kottu", "seafood", "indian"],

  // Middle East
  "turkey": ["turkish", "kebab", "meze", "pide", "lahmacun", "baklava", "doner", "kofte", "lokanta", "ottoman", "mediterranean"],
  "united arab emirates": ["emirati", "arabic", "lebanese", "persian", "middle_eastern", "shawarma", "meze", "grilled_meat", "seafood", "indian"],
  "qatar": ["arabic", "lebanese", "persian", "middle_eastern", "seafood", "grilled_meat", "indian"],

  // Europe — Mediterranean
  "italy": ["italian", "pizza", "pasta", "risotto", "trattoria", "osteria", "gelato", "seafood", "mediterranean", "roman", "tuscan", "sicilian", "neapolitan"],
  "spain": ["spanish", "tapas", "paella", "pintxos", "jamon", "churros", "seafood", "mediterranean", "basque", "catalan", "andalusian"],
  "portugal": ["portuguese", "bacalhau", "pastel_de_nata", "seafood", "grilled_fish", "francesinha", "cozido", "mediterranean"],
  "greece": ["greek", "gyros", "souvlaki", "moussaka", "taverna", "mezze", "seafood", "mediterranean"],
  "croatia": ["croatian", "seafood", "grilled_meat", "mediterranean", "dalmatian", "istrian", "konoba"],

  // Europe — Western
  "france": ["french", "bistro", "brasserie", "patisserie", "crêpe", "wine_bar", "provençal", "alsatian", "seafood", "mediterranean"],
  "germany": ["german", "bavarian", "bratwurst", "schnitzel", "beer_garden", "currywurst", "pretzel", "bierkeller"],
  "netherlands": ["dutch", "indonesian", "surinamese", "herring", "stroopwafel", "bitterballen", "pancake"],
  "london": ["british", "pub", "gastropub", "indian", "curry", "bangladeshi", "turkish", "lebanese", "ethiopian", "chinese", "cantonese", "dim_sum", "japanese", "ramen", "sushi", "korean", "vietnamese", "thai", "caribbean", "jamaican", "nigerian", "west_african", "persian", "afghan", "greek", "portuguese", "tapas", "seafood", "pie", "fish_and_chips", "sunday_roast", "brunch", "sourdough", "bakery", "middle_eastern", "polish", "italian"],
  "united kingdom": ["british", "pub", "fish_and_chips", "pie", "roast", "curry", "gastropub", "sunday_roast", "indian", "turkish", "chinese", "thai", "vietnamese", "korean", "caribbean", "seafood", "bakery"],
  "england": ["british", "pub", "fish_and_chips", "pie", "roast", "curry", "gastropub", "sunday_roast", "indian", "turkish", "chinese", "thai", "vietnamese", "korean", "caribbean", "seafood", "bakery"],

  // Americas
  "mexico": ["mexican", "taco", "mole", "pozole", "tamale", "enchilada", "mezcal", "street_food", "oaxacan", "yucatecan", "seafood"],
  "brazil": ["brazilian", "churrasco", "feijoada", "açaí", "pão_de_queijo", "seafood", "baiana", "gaucho"],
  "peru": ["peruvian", "ceviche", "lomo_saltado", "anticucho", "pisco", "nikkei", "criollo", "seafood"],
  "united states": ["american", "bbq", "burger", "soul_food", "cajun", "tex_mex", "seafood", "steak", "diner", "southern"],

  // Africa
  "morocco": ["moroccan", "tagine", "couscous", "pastilla", "harira", "street_food", "north_african", "berber"],
  "south africa": ["south_african", "braai", "biltong", "bunny_chow", "bobotie", "cape_malay", "seafood"],
  "egypt": ["egyptian", "koshari", "ful_medames", "grilled_meat", "middle_eastern", "seafood", "arabic"],

  // Oceania
  "australia": ["australian", "modern_australian", "seafood", "asian", "mediterranean", "bbq", "cafe", "brunch"],
  "new zealand": ["new_zealand", "seafood", "maori", "pacific", "lamb", "modern", "cafe"],
};

// Non-local Western cuisines that should be penalised when appearing in non-Western countries
const WESTERN_CUISINES = [
  "italian", "pizza", "pasta", "american", "burger", "french", "german",
  "fish_and_chips", "steak_house", "sandwich", "bagel", "deli",
  "tex_mex", "british", "irish",
];

// Countries/regions where Western food IS local (don't penalise there)
const WESTERN_COUNTRIES = new Set([
  "italy", "france", "germany", "spain", "portugal", "greece", "croatia",
  "united kingdom", "england", "scotland", "wales", "ireland", "netherlands",
  "belgium", "switzerland", "austria", "sweden", "norway", "denmark", "finland",
  "united states", "canada", "australia", "new zealand",
]);

function getLocalCuisines(city: string, country: string): string[] {
  const cityLower = city.toLowerCase();
  const countryLower = country.toLowerCase();
  // City-specific overrides first, then country
  return REGIONAL_CUISINES[cityLower] || REGIONAL_CUISINES[countryLower] || [];
}

function isLocalCuisine(cuisineTag: string, city: string, country: string): boolean {
  const local = getLocalCuisines(city, country);
  if (local.length === 0) return true; // if we don't know the region, don't filter
  const lower = cuisineTag.toLowerCase().replace(/[;,]/g, " ");
  return local.some((c) => lower.includes(c.replace(/_/g, " ")) || lower.includes(c));
}

function isNonLocalWesternFood(cuisineTag: string, country: string): boolean {
  if (WESTERN_COUNTRIES.has(country.toLowerCase())) return false;
  const lower = cuisineTag.toLowerCase().replace(/[;,]/g, " ");
  return WESTERN_CUISINES.some((w) => lower.includes(w.replace(/_/g, " ")) || lower.includes(w));
}

// Chains and tourist traps to block — these are never "authentic local" spots
const CHAIN_BLOCKLIST = [
  "hard rock", "mcdonald", "burger king", "kfc", "subway", "starbucks", "costa coffee",
  "pizza hut", "domino", "papa john", "taco bell", "wendy", "five guys", "nando",
  "wagamama", "yo! sushi", "pret a manger", "greggs", "leon", "itsu",
  "t.g.i. friday", "tgi friday", "chili's", "applebee", "olive garden", "outback",
  "the cheesecake factory", "ihop", "denny", "hooters", "planet hollywood",
  "rainforest cafe", "bubba gump", "johnny rocket", "shake shack",
  "popeyes", "chick-fil-a", "chipotle", "panera", "dunkin",
  "tim horton", "krispy kreme", "baskin", "haagen", "cold stone",
  "pizza express", "zizzi", "prezzo", "frankie & benny", "carluccio",
  "las iguanas", "bella italia", "cafe rouge", "giraffe",
  "paul", "le pain quotidien",
  "spaghetti house", "strada", "gourmet burger kitchen", "gbk", "honest burger",
  "tortilla", "leon", "wasabi", "abokado", "eat.", "pod", "pho",
  "jamie's italian", "jamie oliver", "bill's", "the ivy collection",
  "cote", "côte", "gaucho", "busaba", "ping pong", "wahaca",
  "yo sushi", "benihana", "tgi", "jamies",
];

function isChainRestaurant(name: string): boolean {
  const lower = name.toLowerCase();
  return CHAIN_BLOCKLIST.some((chain) => lower.includes(chain));
}

function classifyFoodTier(tags: Record<string, string>, type: string): FoodItem["tier"] {
  // Fine dining signals
  if (tags.stars || tags["cuisine:fine_dining"]) return "fine_dining";
  if (/michelin|fine dining|gastronomic|tasting menu/i.test(tags.description || "")) return "fine_dining";

  // Upscale signals
  if (tags.website && tags.phone && tags.opening_hours && tags["addr:street"]) {
    if (/cocktail|wine bar|rooftop|terrace/i.test((tags.cuisine || "") + " " + (tags.description || ""))) return "upscale";
    if (tags.outdoor_seating === "yes" && tags.wikipedia) return "upscale";
  }
  if (tags.wikipedia || tags.wikidata) return "upscale";
  if (type === "bar") return "upscale";

  // Budget signals
  if (type === "street_food" || type === "cafe") return "budget";
  if (/kebab|falafel|shawarma|fast|takeaway|bakery|patisserie|snack/i.test(tags.cuisine || "")) return "budget";
  if (!tags.phone && !tags.website && !tags["addr:street"]) return "budget";

  // Everything else is mid-range
  return "mid_range";
}

async function fetchFood(lat: number, lon: number, city: string, country: string): Promise<FoodItem[]> {
  const allFood: FoodItem[] = [];
  const seen = new Set<string>();

  const addFood = (item: FoodItem) => {
    const key = item.name.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    allFood.push(item);
  };

  // ── LAYER 1: Curated restaurants (best quality, always shown first) ──
  const cityLower = city.toLowerCase();
  const curated = CURATED_RESTAURANTS[cityLower] || [];
  for (const r of curated) {
    addFood({
      name: r.name,
      cuisine: r.cuisine,
      description: r.description,
      address: r.neighbourhood || null,
      openingHours: null,
      tier: r.tier,
      type: r.type,
      meals: r.meals,
    });
  }

  // ── LAYER 2: Wikipedia notable restaurants in the city ──
  try {
    const citySlug = city.replace(/ /g, "_");
    const wikiCategories = [
      `Restaurants_in_${citySlug}`,
      `Michelin_Guide_restaurants_in_${citySlug}`,
      `Restaurants_in_${country.replace(/ /g, "_")}`,
    ];

    const wikiTitles = await Promise.all(
      wikiCategories.map((cat) => fetchCategoryMembers(cat, 15))
    ).then((a) => [...new Set(a.flat())]);

    if (wikiTitles.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < wikiTitles.length; i += batchSize) {
        const batch = wikiTitles.slice(i, i + batchSize);
        const data = await fetchJsonPost(
          WIKI_BASE,
          `action=query&titles=${encodeURIComponent(batch.join("|"))}&prop=description|extracts&exintro=1&exchars=200&format=json`
        );
        if (!data?.query?.pages) continue;

        (Object.values(data.query.pages) as Record<string, unknown>[]).forEach((p) => {
          if ((p as { missing?: boolean }).missing) return;
          const page = p as { title: string; description?: string; extract?: string };
          const desc = (page.description || "").toLowerCase();
          // Filter out non-restaurant results
          if (/person|born|died|film|company|song|album|species|software/i.test(desc)) return;
          if (isChainRestaurant(page.title)) return;

          // Determine tier from description
          let tier: FoodItem["tier"] = "upscale"; // Wikipedia restaurants tend to be notable = upscale+
          if (/michelin|fine dining|starred/i.test(desc + " " + (page.extract || ""))) tier = "fine_dining";
          if (/street food|stall|hawker|market/i.test(desc)) tier = "budget";
          if (/cafe|bakery|coffee/i.test(desc)) tier = "mid_range";

          // Extract cuisine type from description
          let cuisine = "Restaurant";
          const extract = (page.extract || "").toLowerCase();
          if (/japanese|sushi|ramen/i.test(desc + extract)) cuisine = "Japanese";
          else if (/chinese|cantonese|dim sum/i.test(desc + extract)) cuisine = "Chinese";
          else if (/korean/i.test(desc + extract)) cuisine = "Korean";
          else if (/thai/i.test(desc + extract)) cuisine = "Thai";
          else if (/indian|curry/i.test(desc + extract)) cuisine = "Indian";
          else if (/italian|pasta|pizza/i.test(desc + extract)) cuisine = "Italian";
          else if (/french/i.test(desc + extract)) cuisine = "French";
          else if (/mexican|taco/i.test(desc + extract)) cuisine = "Mexican";
          else if (/turkish|kebab/i.test(desc + extract)) cuisine = "Turkish";
          else if (/seafood/i.test(desc + extract)) cuisine = "Seafood";
          else if (/spanish|tapas/i.test(desc + extract)) cuisine = "Spanish";

          const description = page.extract
            ? page.extract.replace(/<[^>]*>/g, "").slice(0, 200)
            : page.description || `Notable restaurant in ${city}.`;

          // Infer meal suitability from type/tier
          const wikiMeals: MealType[] = tier === "fine_dining" ? ["dinner"]
            : /cafe|bakery|coffee/i.test(desc) ? ["breakfast", "lunch"]
            : /street food|stall|hawker|market/i.test(desc) ? ["breakfast", "lunch"]
            : ["lunch", "dinner"];

          addFood({
            name: page.title,
            cuisine,
            description,
            address: null,
            openingHours: null,
            tier,
            type: tier === "fine_dining" ? "fine_dining" : "restaurant",
            meals: wikiMeals,
          });
        });
      }
    }
  } catch { /* Wikipedia failed, continue with other sources */ }

  // ── LAYER 3: Overpass API (fill gaps only — if curated + wiki didn't give us enough) ──
  if (allFood.length < 30) {
    try {
      const queries = [
        { q: `node["amenity"="restaurant"]["name"]["cuisine"]`, type: "restaurant" as const, limit: 50 },
        { q: `node["amenity"="cafe"]["name"]["cuisine"]`, type: "cafe" as const, limit: 15 },
        { q: `node["amenity"="restaurant"]["name"]["stars"~"."]`, type: "fine_dining" as const, limit: 10 },
      ];

      for (const { q, type, limit } of queries) {
        for (const radius of [5000, 3000]) {
          try {
            const query = `[out:json][timeout:15];${q}(around:${radius},${lat},${lon});out body ${limit};`;
            const res = await fetch("https://overpass-api.de/api/interpreter", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `data=${encodeURIComponent(query)}`,
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (data.remark?.includes("timed out") || !data.elements?.length) continue;

            data.elements
              .filter((el: Record<string, unknown>) => {
                const tags = el.tags as Record<string, string> | undefined;
                if (!tags?.name) return false;
                const name = tags["name:en"] || tags.name;
                if (isChainRestaurant(name)) return false;
                return true;
              })
              .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
                // Sort by quality signals before adding
                const tagsA = a.tags as Record<string, string>;
                const tagsB = b.tags as Record<string, string>;
                const scoreA = (tagsA.wikipedia ? 15 : 0) + (tagsA.wikidata ? 10 : 0) + (tagsA.stars ? 20 : 0) + (tagsA.description ? 5 : 0) + (tagsA.website ? 3 : 0);
                const scoreB = (tagsB.wikipedia ? 15 : 0) + (tagsB.wikidata ? 10 : 0) + (tagsB.stars ? 20 : 0) + (tagsB.description ? 5 : 0) + (tagsB.website ? 3 : 0);
                return scoreB - scoreA;
              })
              .forEach((el: Record<string, unknown>) => {
                const tags = el.tags as Record<string, string>;
                const cuisine = (tags.cuisine || "").toLowerCase();

                // Skip non-local Western food in non-Western countries
                if (isNonLocalWesternFood(cuisine, country)) return;

                const localName = tags.name;
                const englishName = tags["name:en"] || "";
                const hasNonLatin = /[^\u0000-\u024F\u1E00-\u1EFF]/.test(localName);
                const displayName = !hasNonLatin ? localName : englishName ? `${englishName} (${localName})` : localName;

                const inferredTier = classifyFoodTier(tags, type);
                const overpassMeals: MealType[] = type === "cafe" ? ["breakfast", "lunch"]
                  : inferredTier === "fine_dining" ? ["dinner"]
                  : ["lunch", "dinner"];

                addFood({
                  name: displayName,
                  cuisine: tags.cuisine?.split(";")[0] || (type === "cafe" ? "Cafe" : "Restaurant"),
                  description: tags.description || "",
                  address: tags["addr:street"]
                    ? `${tags["addr:housenumber"] ? tags["addr:housenumber"] + " " : ""}${tags["addr:street"]}`
                    : tags["addr:full"] || null,
                  openingHours: tags.opening_hours || null,
                  tier: inferredTier,
                  type,
                  meals: overpassMeals,
                });
              });
            break;
          } catch { continue; }
        }
      }
    } catch { /* Overpass failed */ }
  }

  // Ensure good tier distribution in final output
  const byTier: Record<string, FoodItem[]> = {
    budget: [], mid_range: [], upscale: [], fine_dining: [],
  };
  for (const item of allFood) {
    if (byTier[item.tier].length < 18) byTier[item.tier].push(item);
  }

  // Interleave tiers for variety across the trip
  const result: FoodItem[] = [];
  const maxPerTier = Math.max(...Object.values(byTier).map((a) => a.length));
  for (let i = 0; i < maxPerTier && result.length < 60; i++) {
    if (byTier.mid_range[i]) result.push(byTier.mid_range[i]);
    if (byTier.upscale[i]) result.push(byTier.upscale[i]);
    if (byTier.budget[i]) result.push(byTier.budget[i]);
    if (byTier.fine_dining[i]) result.push(byTier.fine_dining[i]);
  }

  return result;
}

async function fetchPhotos(lat: number, lon: number, city: string): Promise<PhotoItem[]> {
  try {
    const citySlug = city.replace(/ /g, "_");

    const [catResults, searchResults] = await Promise.all([
      Promise.all(
        ["Beaches", "Parks", "Gardens", "Viewpoints", "Observation_towers"].map((t) =>
          fetchCategoryMembers(`${t}_in_${citySlug}`, 15)
        )
      ).then((a) => a.flat()),

      Promise.all([
        `${city} viewpoint observation deck panoramic view`,
        `${city} rooftop bar skyline`,
        `${city} beach scenic sunset sunrise`,
        `${city} mountain hiking trail vista`,
        `${city} harbour waterfront promenade`,
        `${city} park garden scenic`,
        `${city} bridge iconic landmark`,
        `${city} photography spot instagram`,
      ].map((q) =>
        fetchJson(
          `${WIKI_BASE}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=0&srlimit=8&format=json`
        ).then((d) => (d?.query?.search || []).map((s: { title: string }) => s.title))
      )).then((a) => a.flat()),
    ]);

    const allTitles = [...new Set([...catResults, ...searchResults])].filter((t) => {
      if (t.toLowerCase() === city.toLowerCase()) return false;
      if (/^(list|history|tourism|culture|geography|transport) (of|in)/i.test(t)) return false;
      if (/\(film\)|\(song\)|\(album\)|\(company\)/i.test(t)) return false;
      if (/university|college|airport|hospital|prison/i.test(t)) return false;
      return true;
    });

    if (allTitles.length === 0) return [];

    const batch = allTitles.slice(0, 20);
    const data = await fetchJsonPost(
      WIKI_BASE,
      `action=query&titles=${encodeURIComponent(batch.join("|"))}&prop=description&format=json`
    );
    if (!data?.query?.pages) return [];

    return (Object.values(data.query.pages) as Record<string, unknown>[])
      .filter((p) => {
        if ((p as { missing?: boolean }).missing) return false;
        const desc = ((p as { description?: string }).description || "").toLowerCase();
        if (/person|born|film|company|war|battle|football|municipality|province/i.test(desc)) return false;
        return true;
      })
      .map((p) => {
        const page = p as { title: string; description?: string };
        const combined = ((page.description || "") + " " + page.title).toLowerCase();
        let category = "Scenic Spot";
        if (/viewpoint|observation|panoram|overlook/i.test(combined)) category = "Viewpoint";
        else if (/rooftop|sky bar|skyline/i.test(combined)) category = "Rooftop";
        else if (/beach|coast|bay/i.test(combined)) category = "Beach";
        else if (/mountain|peak|hill|volcano/i.test(combined)) category = "Mountain View";
        else if (/park|garden|botanical/i.test(combined)) category = "Park";
        else if (/bridge|monument|gate|arch/i.test(combined)) category = "Landmark";
        else if (/tower|skyscraper/i.test(combined)) category = "Observation Deck";
        else if (/lake|waterfall|river|island/i.test(combined)) category = "Nature";
        return { name: page.title, category, description: page.description || "" };
      })
      .slice(0, 20);
  } catch {
    return [];
  }
}

// Region-specific experiences that tourists actually want to do
const REGIONAL_EXCURSIONS: Record<string, { name: string; type: string; description: string; duration: string }[]> = {
  "south korea": [
    { name: "Jjimjilbang (Korean Spa)", type: "Wellness", description: "Spend a few hours at a traditional Korean bathhouse. Soak in hot and cold pools, try the sauna rooms, and relax like a local — many are open 24 hours.", duration: "3-4 hours" },
    { name: "DMZ Tour", type: "Cultural Experience", description: "Visit the Korean Demilitarised Zone, one of the most heavily fortified borders in the world. See the Joint Security Area and learn about the Korean War.", duration: "Full day" },
    { name: "Hanbok Experience", type: "Cultural Experience", description: "Rent a traditional Korean hanbok and walk through historic palace grounds and traditional villages. Free entry to many palaces when wearing hanbok.", duration: "2-3 hours" },
    { name: "Korean BBQ Cooking Class", type: "Food Experience", description: "Learn to make authentic Korean BBQ, kimchi, and banchan with a local chef. Visit a traditional market for ingredients, then cook and feast together.", duration: "4-5 hours" },
    { name: "K-Pop & K-Culture Tour", type: "Cultural Experience", description: "Visit iconic K-pop locations, entertainment company buildings, and themed cafes. Experience a noraebang (Korean karaoke) session.", duration: "3-4 hours" },
    { name: "Temple Stay Experience", type: "Cultural Experience", description: "Spend time at a Buddhist temple. Participate in meditation, tea ceremony, and traditional monk meals for a peaceful cultural immersion.", duration: "Half day" },
    { name: "Korean Street Food Night Tour", type: "Food Experience", description: "Explore bustling night markets sampling tteokbokki, hotteok, gimbap, Korean fried chicken, and other street food favourites.", duration: "3 hours" },
    { name: "Soju & Makgeolli Tasting", type: "Food Experience", description: "Join a guided Korean drinks tasting. Sample different soju varieties, traditional makgeolli (rice wine), and learn proper drinking etiquette.", duration: "2-3 hours" },
    { name: "Bukhansan National Park Hike", type: "Hiking", description: "Hike one of Seoul's surrounding mountain trails with stunning views over the city. Multiple difficulty levels available.", duration: "4-6 hours" },
    { name: "Traditional Market Tour", type: "Food Experience", description: "Explore vibrant traditional markets like Gwangjang or Namdaemun. Try bindaetteok (mung bean pancakes), raw beef bibimbap, and knife-cut noodles.", duration: "3-4 hours" },
  ],
  "japan": [
    { name: "Onsen (Hot Spring) Experience", type: "Wellness", description: "Soak in a traditional Japanese hot spring. Learn the bathing etiquette and relax in mineral-rich waters with mountain or garden views.", duration: "2-3 hours" },
    { name: "Sushi Making Class", type: "Food Experience", description: "Learn to prepare sushi, sashimi, and maki rolls with a professional sushi chef. Includes a visit to the morning fish market.", duration: "3-4 hours" },
    { name: "Ramen Workshop", type: "Food Experience", description: "Create your own bowl of ramen from scratch — make the broth, noodles, and toppings. Take home the recipes.", duration: "3 hours" },
    { name: "Tea Ceremony Experience", type: "Cultural Experience", description: "Participate in a traditional Japanese tea ceremony (chanoyu). Learn about matcha preparation, wagashi sweets, and the philosophy behind it.", duration: "1-2 hours" },
    { name: "Sake Brewery Tour & Tasting", type: "Food Experience", description: "Visit a local sake brewery, learn about the brewing process, and sample premium sake varieties you can't find outside Japan.", duration: "2-3 hours" },
    { name: "Kimono Rental & Photo Walk", type: "Cultural Experience", description: "Dress in a beautiful kimono or yukata and stroll through historic districts. Professional photo spots at temples and gardens.", duration: "3-4 hours" },
    { name: "Tsukiji/Toyosu Market Tour", type: "Food Experience", description: "Explore the famous fish market at dawn. Sample the freshest sushi, tamagoyaki, and street food from specialist stalls.", duration: "3-4 hours" },
    { name: "Mount Fuji Day Trip", type: "Day Trip", description: "Visit the iconic Mount Fuji area. Explore the Five Lakes region, visit Chureito Pagoda, and take in breathtaking views.", duration: "Full day" },
    { name: "Izakaya Hopping Night Tour", type: "Food Experience", description: "Experience Japanese nightlife by hopping between traditional izakaya (pub-style bars). Try yakitori, karaage, and local craft beers.", duration: "3 hours" },
    { name: "Bamboo Forest & Temple Walk", type: "Nature Excursion", description: "Walk through serene bamboo groves and visit ancient temples. A peaceful escape from the city buzz.", duration: "Half day" },
  ],
  "hong kong": [
    { name: "Dim Sum Masterclass", type: "Food Experience", description: "Learn to fold and steam har gow, siu mai, char siu bao, and other dim sum classics with a Cantonese chef.", duration: "3-4 hours" },
    { name: "Hong Kong Island Tram Tour", type: "Cultural Experience", description: "Ride the iconic double-decker tram from end to end across Hong Kong Island. See the city transform from financial hub to traditional neighbourhoods.", duration: "2 hours" },
    { name: "Lantau Island & Big Buddha", type: "Day Trip", description: "Take the Ngong Ping cable car to see the giant Tian Tan Buddha. Explore Tai O fishing village and sample local street food.", duration: "Full day" },
    { name: "Victoria Peak Sunset Hike", type: "Hiking", description: "Hike up to Victoria Peak via the Morning Trail for panoramic views of the harbour and skyline at golden hour.", duration: "2-3 hours" },
    { name: "Dai Pai Dong Food Tour", type: "Food Experience", description: "Eat at traditional open-air street food stalls (dai pai dong). Try wonton noodles, clay pot rice, typhoon shelter crab, and egg waffles.", duration: "3 hours" },
    { name: "Junk Boat Trip", type: "Boat Trip", description: "Cruise Hong Kong's harbour on a traditional junk boat. Many trips include stops at hidden beaches and seafood BBQ.", duration: "Half day" },
    { name: "Cha Chaan Teng Crawl", type: "Food Experience", description: "Visit iconic Hong Kong-style cafes for milk tea, pineapple buns, macaroni soup, and French toast — the ultimate local breakfast.", duration: "2-3 hours" },
    { name: "Dragon's Back Ridge Walk", type: "Hiking", description: "Hike Hong Kong's most scenic ridge trail with stunning ocean views and finish at a beach. Easy to moderate difficulty.", duration: "3-4 hours" },
    { name: "Temple Street Night Market", type: "Cultural Experience", description: "Browse the bustling night market for street food, fortune tellers, and Cantonese opera. The atmosphere is electric after dark.", duration: "2-3 hours" },
    { name: "Outlying Islands Hopping", type: "Day Trip", description: "Ferry to Cheung Chau or Lamma Island for car-free villages, fresh seafood restaurants, and secluded beaches.", duration: "Full day" },
  ],
  "thailand": [
    { name: "Thai Cooking Class", type: "Food Experience", description: "Visit a morning market for fresh ingredients, then learn to cook pad thai, green curry, tom yum, and mango sticky rice.", duration: "4-5 hours" },
    { name: "Floating Market Tour", type: "Cultural Experience", description: "Visit a traditional floating market by longtail boat. Buy fresh tropical fruit, coconut ice cream, and pad thai from boat vendors.", duration: "Half day" },
    { name: "Thai Boxing Class", type: "Active Experience", description: "Try a Muay Thai training session with professional fighters. All fitness levels welcome — great workout and cultural insight.", duration: "2 hours" },
    { name: "Temple & Tuk-Tuk Tour", type: "Cultural Experience", description: "Explore the city's most beautiful temples by tuk-tuk. Visit golden stupas, reclining Buddhas, and sacred grounds.", duration: "Half day" },
    { name: "Island Hopping & Snorkelling", type: "Water Sports", description: "Speedboat to crystal-clear island beaches. Snorkel over coral reefs, swim in emerald lagoons, and have a beachside lunch.", duration: "Full day" },
    { name: "Night Market Food Safari", type: "Food Experience", description: "Navigate Bangkok's best night markets sampling satay, mango sticky rice, roti, som tum, and grilled seafood skewers.", duration: "3 hours" },
    { name: "Thai Massage & Spa Day", type: "Wellness", description: "Indulge in a traditional Thai massage followed by herbal steam and aromatherapy treatments at a luxury spa.", duration: "3-4 hours" },
    { name: "Elephant Sanctuary Visit", type: "Nature Excursion", description: "Visit an ethical elephant sanctuary. Feed, bathe, and walk with rescued elephants in a natural habitat — no riding.", duration: "Full day" },
    { name: "Street Art & Coffee Tour", type: "Cultural Experience", description: "Discover hidden street art, independent coffee roasters, and creative spaces in the city's artistic neighbourhoods.", duration: "3 hours" },
    { name: "Khao Yai National Park", type: "Nature Excursion", description: "Day trip to Thailand's oldest national park. Spot gibbons and hornbills, hike through jungle trails, and visit waterfalls.", duration: "Full day" },
  ],
  "singapore": [
    { name: "Hawker Centre Food Tour", type: "Food Experience", description: "Eat your way through Singapore's legendary hawker centres. Try chicken rice, laksa, char kway teow, satay, and chilli crab.", duration: "3-4 hours" },
    { name: "Peranakan Culture Walk", type: "Cultural Experience", description: "Explore the colourful Peranakan heritage in Katong and Joo Chiat. Visit shophouses, try nyonya kueh, and learn about Straits Chinese culture.", duration: "3 hours" },
    { name: "Singapore Sling at Raffles", type: "Cultural Experience", description: "Sip the iconic Singapore Sling cocktail at the Long Bar in Raffles Hotel, where it was invented in 1915.", duration: "1-2 hours" },
    { name: "Gardens by the Bay Night Show", type: "Cultural Experience", description: "Watch the spectacular Supertree light and sound show. Walk the elevated Skyway for views over Marina Bay.", duration: "2 hours" },
    { name: "Little India Spice Tour", type: "Food Experience", description: "Explore Little India's spice shops, flower garlands, and curry houses. Sample biryani, roti prata, and masala chai.", duration: "3 hours" },
    { name: "Pulau Ubin Cycling Adventure", type: "Nature Excursion", description: "Ferry to this rustic island and cycle through kampong (village) trails, mangroves, and quarry lakes — old Singapore preserved.", duration: "Half day" },
  ],
  "italy": [
    { name: "Pasta Making Class", type: "Food Experience", description: "Learn to make fresh pasta from scratch — tagliatelle, ravioli, and more — with a local nonna or professional chef. Wine included.", duration: "3-4 hours" },
    { name: "Wine Tasting in the Hills", type: "Food Experience", description: "Visit a family-run vineyard for a tour of the cellars and a guided tasting of regional wines paired with local cheeses and cured meats.", duration: "Half day" },
    { name: "Gelato Making Workshop", type: "Food Experience", description: "Learn the art of Italian gelato from a master gelatiere. Make your own flavours and take home the secrets.", duration: "2 hours" },
    { name: "Vespa Countryside Tour", type: "Day Trip", description: "Ride a Vespa through rolling countryside, olive groves, and hilltop villages. Stop for espresso and panoramic views.", duration: "Half day" },
    { name: "Aperitivo & Spritz Walking Tour", type: "Food Experience", description: "Join the Italian tradition of pre-dinner drinks. Visit the best aperitivo bars for Aperol Spritz, Negroni, and complimentary snacks.", duration: "2-3 hours" },
    { name: "Truffle Hunting Experience", type: "Food Experience", description: "Join a truffle hunter and their trained dog to search for truffles in the woods. Finish with a truffle-infused meal.", duration: "Half day" },
    { name: "Street Food & Market Tour", type: "Food Experience", description: "Explore a bustling Italian market and sample arancini, supplì, porchetta, fresh mozzarella, and seasonal produce.", duration: "3 hours" },
    { name: "Coastal Boat Excursion", type: "Boat Trip", description: "Cruise along the stunning coastline, swim in hidden coves, and enjoy a fresh seafood lunch on board.", duration: "Full day" },
  ],
  "spain": [
    { name: "Tapas & Wine Crawl", type: "Food Experience", description: "Bar-hop through the best tapas joints with a local guide. Sample patatas bravas, jamón ibérico, croquetas, and local wines.", duration: "3-4 hours" },
    { name: "Paella Cooking Class", type: "Food Experience", description: "Learn to cook authentic paella — from preparing the sofrito to achieving the perfect socarrat — with a local chef. Sangria included.", duration: "3-4 hours" },
    { name: "Flamenco Show & Dinner", type: "Cultural Experience", description: "Experience passionate flamenco in an intimate tablao. Includes a traditional Andalusian dinner and drinks.", duration: "3 hours" },
    { name: "Churros & Chocolate Tour", type: "Food Experience", description: "Visit the best churrerías in the city, from century-old institutions to modern artisan spots. Learn the art of the perfect churro.", duration: "2 hours" },
    { name: "Pintxos Bar Hopping", type: "Food Experience", description: "Explore the pintxos (Basque tapas) scene — choose from elaborate bites displayed on bar counters, paired with txakoli wine.", duration: "3 hours" },
    { name: "Kayaking & Beach Day", type: "Water Sports", description: "Paddle along the Mediterranean coast by kayak, explore sea caves, and relax on secluded beaches.", duration: "Half day" },
  ],
  "france": [
    { name: "French Patisserie Class", type: "Food Experience", description: "Master croissants, éclairs, or macarons with a pastry chef. Take home your creations and the recipes.", duration: "3-4 hours" },
    { name: "Wine & Cheese Pairing", type: "Food Experience", description: "Learn to pair French wines with artisanal cheeses in a guided tasting. Explore the differences between regions.", duration: "2-3 hours" },
    { name: "Marché & Brasserie Breakfast Tour", type: "Food Experience", description: "Start the day like a Parisian: visit a morning market for fresh produce, stop at a boulangerie, then sit at a classic brasserie.", duration: "3 hours" },
    { name: "Seine River Cruise", type: "Boat Trip", description: "Glide past iconic landmarks on a scenic river cruise. Evening cruises include wine and a stunning light show.", duration: "2 hours" },
    { name: "Champagne Day Trip", type: "Day Trip", description: "Visit the Champagne region. Tour underground cellars, taste prestige cuvées, and lunch in a vineyard.", duration: "Full day" },
    { name: "Vintage & Flea Market Hunt", type: "Cultural Experience", description: "Explore the city's best flea markets and vintage shops for unique finds, antiques, and one-of-a-kind souvenirs.", duration: "3 hours" },
  ],
  "vietnam": [
    { name: "Pho & Banh Mi Masterclass", type: "Food Experience", description: "Learn to make Vietnam's iconic dishes — slow-cooked pho broth and crispy banh mi — with a local chef.", duration: "3-4 hours" },
    { name: "Motorbike Street Food Tour", type: "Food Experience", description: "Hop on the back of a motorbike and eat your way through hidden alleys. Try bun cha, spring rolls, egg coffee, and more.", duration: "4 hours" },
    { name: "Ha Long Bay Cruise", type: "Boat Trip", description: "Cruise through thousands of limestone karsts and islets. Kayak into caves, swim, and enjoy fresh seafood on board.", duration: "Full day" },
    { name: "Lantern Making in Hoi An", type: "Cultural Experience", description: "Craft your own Vietnamese silk lantern in Hoi An's ancient town. Release lanterns on the river at dusk.", duration: "2-3 hours" },
    { name: "Vietnamese Coffee Culture Tour", type: "Food Experience", description: "Discover ca phe sua da (iced milk coffee), egg coffee, and coconut coffee at the best cafes and hidden rooftop spots.", duration: "2-3 hours" },
    { name: "Mekong Delta Day Trip", type: "Day Trip", description: "Explore the lush Mekong Delta by boat. Visit floating markets, coconut candy workshops, and riverside villages.", duration: "Full day" },
  ],
  "mexico": [
    { name: "Taco & Mezcal Tour", type: "Food Experience", description: "Sample the best tacos al pastor, birria, and carnitas across multiple taquerías, paired with artisanal mezcal and micheladas.", duration: "4 hours" },
    { name: "Mole Cooking Class", type: "Food Experience", description: "Learn to make complex mole sauce from scratch — grinding chillies, chocolate, and spices. A true labour of love.", duration: "4-5 hours" },
    { name: "Lucha Libre Night", type: "Cultural Experience", description: "Watch Mexican wrestling (lucha libre) in a packed arena. The atmosphere is electric — masks, flips, and crowd chaos.", duration: "3 hours" },
    { name: "Cenote Swimming", type: "Nature Excursion", description: "Swim in stunning underground cenotes (natural sinkholes). Crystal-clear turquoise water in a cathedral-like cave.", duration: "Half day" },
    { name: "Tequila Distillery Tour", type: "Food Experience", description: "Visit a traditional tequila distillery. Learn the agave harvesting process and sample aged añejo varieties.", duration: "Half day" },
    { name: "Street Market & Antojitos Tour", type: "Food Experience", description: "Navigate bustling markets for tamales, elote, tlayudas, and fresh tropical fruit with chilli and lime.", duration: "3 hours" },
  ],
  "turkey": [
    { name: "Turkish Breakfast Feast", type: "Food Experience", description: "Experience a traditional Turkish breakfast spread — menemen, börek, sucuk, fresh bread, honey, kaymak, and endless çay.", duration: "2-3 hours" },
    { name: "Hammam (Turkish Bath)", type: "Wellness", description: "Visit a centuries-old hammam for a traditional scrub, foam massage, and steam. An essential Turkish wellness ritual.", duration: "2-3 hours" },
    { name: "Hot Air Balloon Ride", type: "Adventure", description: "Float above dramatic landscapes at sunrise. Watch the terrain transform in the golden morning light.", duration: "3-4 hours" },
    { name: "Kebab & Meze Tasting Tour", type: "Food Experience", description: "Go beyond the tourist kebab. Sample regional varieties — Adana, Iskender, shish — plus cold meze, pide, and baklava.", duration: "3-4 hours" },
    { name: "Bosphorus Cruise", type: "Boat Trip", description: "Cruise between Europe and Asia on the Bosphorus strait. See Ottoman palaces, waterside mansions, and the city skyline.", duration: "3-4 hours" },
    { name: "Turkish Coffee & Baklava Tour", type: "Food Experience", description: "Learn to brew Turkish coffee the traditional way and taste pistchio baklava, künefe, and Turkish delight from the best shops.", duration: "2-3 hours" },
  ],
  "united kingdom": [
    { name: "Pub Crawl & Ale Tasting", type: "Food Experience", description: "Visit historic pubs serving real ales, craft beers, and classic pub grub. Learn the stories behind centuries-old drinking holes.", duration: "3-4 hours" },
    { name: "Afternoon Tea Experience", type: "Food Experience", description: "Enjoy a proper afternoon tea with finger sandwiches, scones with clotted cream and jam, and delicate pastries.", duration: "2 hours" },
    { name: "Borough Market Food Tour", type: "Food Experience", description: "Browse one of the world's great food markets. Sample artisan cheeses, fresh oysters, scotch eggs, and sourdough.", duration: "3 hours" },
    { name: "Countryside & Cotswolds Day Trip", type: "Day Trip", description: "Escape to honey-coloured villages, rolling hills, and quintessential English countryside. Stop for cream tea and a country pub lunch.", duration: "Full day" },
    { name: "Gin Distillery Tour", type: "Food Experience", description: "Visit a craft gin distillery, learn about botanicals, and blend your own signature gin to take home.", duration: "2-3 hours" },
    { name: "Thames River Walk & Markets", type: "Cultural Experience", description: "Walk along the South Bank past street performers, book stalls, and food vendors. Stop at independent galleries and pop-ups.", duration: "3 hours" },
  ],
  "united arab emirates": [
    { name: "Desert Safari & BBQ", type: "Adventure", description: "Dune bashing in 4x4s, camel riding, sandboarding, and a traditional Arabic BBQ dinner under the stars with belly dancing.", duration: "Half day" },
    { name: "Souq & Spice Market Tour", type: "Cultural Experience", description: "Explore traditional souqs for gold, textiles, and spices. Learn to haggle and sample Arabic coffee and dates.", duration: "3 hours" },
    { name: "Dhow Cruise Dinner", type: "Boat Trip", description: "Sail on a traditional wooden dhow with a lavish buffet dinner, live music, and views of the glittering skyline.", duration: "3 hours" },
    { name: "Arabic Cooking Class", type: "Food Experience", description: "Learn to make hummus, falafel, shawarma, and kunafa from scratch. Discover Middle Eastern spice blends and techniques.", duration: "3-4 hours" },
  ],
  "indonesia": [
    { name: "Balinese Cooking Class", type: "Food Experience", description: "Start at a morning market, then cook nasi goreng, satay, lawar, and sambal in an open-air kitchen surrounded by rice paddies.", duration: "4-5 hours" },
    { name: "Sunrise Trek to Mount Batur", type: "Hiking", description: "Hike an active volcano before dawn. Watch the sunrise from the crater rim with views over the caldera lake.", duration: "6-7 hours" },
    { name: "Rice Terrace Walk & Lunch", type: "Nature Excursion", description: "Walk through stunning terraced rice paddies, meet local farmers, and enjoy a traditional warung lunch with valley views.", duration: "3-4 hours" },
    { name: "Snorkelling at Nusa Penida", type: "Water Sports", description: "Speedboat to Nusa Penida for world-class snorkelling. Swim with manta rays and explore crystal-clear reef systems.", duration: "Full day" },
    { name: "Traditional Jamu Workshop", type: "Wellness", description: "Learn about traditional Javanese herbal medicine (jamu). Make your own turmeric, ginger, and tamarind health tonics.", duration: "2 hours" },
    { name: "Ubud Art & Craft Village Walk", type: "Cultural Experience", description: "Visit silversmith workshops, batik studios, and wood carving villages around Ubud. Try your hand at batik making.", duration: "Half day" },
  ],
  "greece": [
    { name: "Olive Oil Tasting & Farm Visit", type: "Food Experience", description: "Visit an olive grove and press, taste premium extra virgin oils, and learn why Greek olive oil is world-famous.", duration: "3 hours" },
    { name: "Greek Cooking Class", type: "Food Experience", description: "Make moussaka, spanakopita, tzatziki, and baklava from scratch using fresh Mediterranean ingredients.", duration: "4 hours" },
    { name: "Island Hopping by Ferry", type: "Day Trip", description: "Hop between nearby islands by ferry. Swim in turquoise coves, explore whitewashed villages, and eat fresh seafood.", duration: "Full day" },
    { name: "Sunset Sailing Cruise", type: "Boat Trip", description: "Sail into the sunset on a catamaran. Swim, snorkel, and enjoy a Greek BBQ on deck with wine.", duration: "Half day" },
    { name: "Taverna Hopping Night", type: "Food Experience", description: "Eat like a Greek — hop between traditional tavernas sampling grilled octopus, souvlaki, saganaki, and local wine.", duration: "3-4 hours" },
  ],
};

// Hard blocklist for garbage Wikipedia results that keep appearing
const EXCURSION_BLOCKLIST = [
  "spam", "iron chef", "masterchef", "come dine", "bake off", "kitchen nightmares",
  "gordon ramsay", "jamie oliver", "anthony bourdain", "wikipedia", "list of",
  "history of", "cuisine of", "culture of", "economy of", "transport in",
  "demographics", "football", "basketball", "baseball", "cricket",
  "tv series", "television", "album", "discography", "filmography",
  "electoral", "election", "government", "parliament", "ministry",
];

async function fetchExcursions(lat: number, lon: number, city: string, country: string): Promise<ExcursionItem[]> {
  const excursions: ExcursionItem[] = [];
  const citySlug = city.replace(/ /g, "_");

  try {
    // 1. Region-specific curated excursions FIRST — these are the best
    const countryLower = country.toLowerCase();
    const cityLower = city.toLowerCase();
    const regional = REGIONAL_EXCURSIONS[countryLower] || REGIONAL_EXCURSIONS[cityLower] || [];
    // Add all regional excursions — they're curated and always good
    excursions.push(...regional);

    // 2. Overpass: real outdoor activities near the location
    const overpassPromise = (async () => {
      for (const radius of [15000, 8000]) {
        try {
          const query = `[out:json][timeout:15];(
            way["route"="hiking"]["name"](around:${radius},${lat},${lon});
            node["sport"="diving"]["name"](around:${radius},${lat},${lon});
            node["sport"="surfing"]["name"](around:${radius},${lat},${lon});
            node["sport"="sailing"]["name"](around:${radius},${lat},${lon});
            node["sport"="kayak"]["name"](around:${radius},${lat},${lon});
            node["leisure"="water_park"]["name"](around:${radius},${lat},${lon});
            node["shop"="boat_rental"]["name"](around:${radius},${lat},${lon});
            node["amenity"="bicycle_rental"]["name"](around:${radius},${lat},${lon});
            node["leisure"="golf_course"]["name"](around:${radius},${lat},${lon});
            node["leisure"="horse_riding"]["name"](around:${radius},${lat},${lon});
          );out body 30;`;

          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (data.remark?.includes("timed out")) continue;

          const seen = new Set(excursions.map((e) => e.name.toLowerCase()));
          (data.elements || []).forEach((el: Record<string, unknown>) => {
            const tags = el.tags as Record<string, string> | undefined;
            const name = tags?.name || tags?.["name:en"] || "";
            if (!name) return;
            const key = name.toLowerCase();
            if (seen.has(key)) return;
            if (EXCURSION_BLOCKLIST.some((b) => key.includes(b))) return;
            seen.add(key);

            const localName = tags!.name || "";
            const englishName = tags!["name:en"] || "";
            const hasNonLatin = /[^\u0000-\u024F\u1E00-\u1EFF]/.test(localName);
            const displayName = !hasNonLatin ? localName : englishName ? `${englishName} (${localName})` : localName;

            let type = "Outdoor Activity";
            let duration = "2-3 hours";
            let desc = "";

            if (tags?.route === "hiking") { type = "Hiking"; duration = "3-5 hours"; desc = `Hike the ${displayName} trail and enjoy the natural scenery around ${city}.`; }
            else if (tags?.sport === "diving") { type = "Scuba Diving"; duration = "Half day"; desc = `Explore underwater wonders with a diving experience near ${city}.`; }
            else if (tags?.sport === "surfing") { type = "Surfing"; duration = "2-3 hours"; desc = `Catch some waves at ${displayName}. Lessons available for beginners.`; }
            else if (tags?.sport === "sailing") { type = "Sailing"; duration = "Half day"; desc = `Set sail from ${displayName} and enjoy the coastline from the water.`; }
            else if (tags?.sport === "kayak") { type = "Kayaking"; duration = "2-3 hours"; desc = `Paddle through scenic waterways at ${displayName}.`; }
            else if (tags?.leisure === "water_park") { type = "Water Park"; duration = "Full day"; desc = `Enjoy thrilling slides and pools at ${displayName}.`; }
            else if (tags?.shop === "boat_rental") { type = "Boat Trip"; duration = "2-4 hours"; desc = `Rent a boat from ${displayName} and explore the waters around ${city}.`; }
            else if (tags?.amenity === "bicycle_rental") { type = "Cycling Tour"; duration = "2-3 hours"; desc = `Rent bikes from ${displayName} and cycle through ${city}'s scenic routes.`; }
            else if (tags?.leisure === "golf_course") { type = "Golf"; duration = "4-5 hours"; desc = `Play a round at ${displayName}, one of the golf courses near ${city}.`; }
            else if (tags?.leisure === "horse_riding") { type = "Horse Riding"; duration = "2-3 hours"; desc = `Enjoy a horseback ride through the countryside near ${city}.`; }
            else { desc = `Visit ${displayName} for an outdoor activity in ${city}.`; }

            excursions.push({ name: displayName, type, description: desc, duration });
          });
          break;
        } catch { continue; }
      }
    })();

    // 3. Wikipedia: actual places near the city (beaches, national parks, islands, trails)
    const wikiPromise = (async () => {
      const catResults = await Promise.all(
        ["Hiking_trails", "Nature_reserves", "Beaches", "National_parks", "Hot_springs", "Islands",
        ].map((t) => fetchCategoryMembers(`${t}_in_${citySlug}`, 5))
      ).then((a) => a.flat());

      // More targeted searches — actual places, not concepts
      const searchResults = await Promise.all([
        `${city} national park nature reserve`,
        `${city} beach coast island`,
        `${city} hiking trail mountain`,
        `${city} ${country} day trip nearby`,
      ].map((q) =>
        fetchJson(
          `${WIKI_BASE}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=0&srlimit=5&format=json`
        ).then((d) => (d?.query?.search || []).map((s: { title: string }) => s.title))
      )).then((a) => a.flat());

      const titles = [...new Set([...catResults, ...searchResults])].filter((t) => {
        const tLower = t.toLowerCase();
        if (tLower === city.toLowerCase()) return false;
        if (/^(list|history|tourism|culture|geography|transport|cuisine|economy|politics) (of|in)/i.test(t)) return false;
        if (/\(film\)|\(song\)|\(company\)|\(band\)|\(novel\)|\(album\)|\(tv\)|\(game\)/i.test(t)) return false;
        if (/university|airport|hospital|school|station|district|ward|borough/i.test(tLower)) return false;
        if (EXCURSION_BLOCKLIST.some((b) => tLower.includes(b))) return false;
        return true;
      }).slice(0, 15);

      if (titles.length === 0) return;

      const data = await fetchJsonPost(
        WIKI_BASE,
        `action=query&titles=${encodeURIComponent(titles.join("|"))}&prop=description&format=json`
      );
      if (!data?.query?.pages) return;

      const seen = new Set(excursions.map((e) => e.name.toLowerCase()));
      (Object.values(data.query.pages) as Record<string, unknown>[]).forEach((p) => {
        if ((p as { missing?: boolean }).missing) return;
        const page = p as { title: string; description?: string };
        const key = page.title.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        const desc = (page.description || "").toLowerCase();
        // Aggressively filter non-excursion content
        if (/person|born|died|film|tv|company|war|battle|football|basketball|baseball|municipality|province|political|album|song|band|actor|actress|singer|novel|species|genus|protein|chemical|software|video game/i.test(desc)) return;
        if (EXCURSION_BLOCKLIST.some((b) => desc.includes(b))) return;

        let type = "Day Trip";
        let duration = "Half day";
        let description = page.description || `Explore ${page.title} as a day excursion from ${city}.`;

        if (/hiking|trail|walk/i.test(desc + " " + page.title)) { type = "Hiking"; duration = "3-5 hours"; }
        else if (/diving|snorkeling|reef/i.test(desc + " " + page.title)) { type = "Water Sports"; duration = "Half day"; }
        else if (/beach/i.test(desc + " " + page.title)) { type = "Beach Day"; duration = "Full day"; }
        else if (/island/i.test(desc + " " + page.title)) { type = "Island Trip"; duration = "Full day"; }
        else if (/national park|nature reserve|forest/i.test(desc + " " + page.title)) { type = "Nature Excursion"; duration = "Full day"; }
        else if (/hot spring|spa|wellness|onsen/i.test(desc + " " + page.title)) { type = "Wellness"; duration = "Half day"; }
        else if (/vineyard|wine|winery/i.test(desc + " " + page.title)) { type = "Wine Tasting"; duration = "Half day"; }
        else if (/surf/i.test(desc + " " + page.title)) { type = "Surfing"; duration = "2-3 hours"; }
        else if (/kayak|canoe|paddle/i.test(desc + " " + page.title)) { type = "Kayaking"; duration = "2-3 hours"; }
        else if (/cruise|boat|sailing|ferry/i.test(desc + " " + page.title)) { type = "Boat Trip"; duration = "3-5 hours"; }
        else if (/mountain|peak|volcano/i.test(desc + " " + page.title)) { type = "Hiking"; duration = "Full day"; }
        else if (/temple|shrine|monastery/i.test(desc + " " + page.title)) { type = "Cultural Experience"; duration = "Half day"; }
        else if (/waterfall/i.test(desc + " " + page.title)) { type = "Nature Excursion"; duration = "Half day"; }

        excursions.push({ name: page.title, type, description, duration });
      });
    })();

    await Promise.all([overpassPromise, wikiPromise]);

    // Fallback generic excursions only if we have very few
    if (excursions.length < 5) {
      const fallbacks = [
        { name: `${city} Walking Food Tour`, type: "Food Experience", description: `Join a guided walking food tour through ${city}'s best neighbourhoods. Sample local street food, visit hidden gems, and learn about the culinary culture.`, duration: "3-4 hours" },
        { name: `${city} Sunset Boat Cruise`, type: "Boat Trip", description: `Enjoy a scenic boat cruise as the sun sets over ${city}. Many tours include drinks and light snacks.`, duration: "2-3 hours" },
        { name: `Cycling Tour of ${city}`, type: "Cycling Tour", description: `Explore ${city} by bicycle! Cover more ground than walking and discover hidden neighbourhoods and local parks.`, duration: "3-4 hours" },
        { name: `${city} Cooking Class`, type: "Food Experience", description: `Learn to cook authentic ${country} dishes with a local chef. Visit the market for fresh ingredients, then cook and eat together.`, duration: "4-5 hours" },
        { name: `Day Trip from ${city}`, type: "Day Trip", description: `Escape the city for a day and explore the surrounding countryside, villages, or natural landscapes near ${city}.`, duration: "Full day" },
        { name: `${city} Night Tour`, type: "Night Tour", description: `See ${city} after dark on a guided night tour. Visit illuminated landmarks, hidden bars, and experience the nightlife.`, duration: "3 hours" },
      ];
      const existing = new Set(excursions.map((e) => e.name.toLowerCase()));
      for (const f of fallbacks) {
        if (excursions.length >= 8) break;
        if (existing.has(f.name.toLowerCase())) continue;
        excursions.push(f);
      }
    }

    return excursions.slice(0, 20);
  } catch {
    return [];
  }
}

// ── Helpers ────────────────────────────────────────────────────────

async function fetchCategoryMembers(category: string, limit: number): Promise<string[]> {
  const data = await fetchJson(
    `${WIKI_BASE}?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmlimit=${limit}&cmtype=page&format=json`
  );
  return (data?.query?.categorymembers || []).map((m: { title: string }) => m.title);
}

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, { headers: WIKI_HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchJsonPost(url: string, body: string) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...WIKI_HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
