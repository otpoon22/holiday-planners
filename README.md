# Garden Leavers Travel Guide

A holiday planner app that generates personalised trip itineraries with flights, restaurants, sightseeing, and excursions. Think Skyscanner meets ChatGPT trip planning.

## Features

**Trip Planner**
- Search any country and city worldwide
- Departure + return date picker (calculates trip duration automatically)
- Preferred departure time filtering (Early Bird / Morning / Afternoon / Evening)
- Cabin class selection (Economy, Premium Economy, Business, First)

**Flight Options**
- Flights grouped by airline — expand to see individual time slots
- Route-scored airline ranking (hub carriers like Cathay Pacific for HKG always appear prominently)
- 45+ airlines with regional classification (no budget carriers on long-haul)
- Sort by price or departure time
- Skyscanner booking links on every flight
- Selecting a different flight dynamically rebuilds the itinerary

**Day-by-Day Itinerary**
- Meal-aware restaurant picks (breakfast from brunch cafes, not dinner restaurants)
- 3-layer food sourcing: curated restaurants first, then Wikipedia notable, then OpenStreetMap
- Curated restaurants for 12 cities with 30+ dedicated breakfast spots
- Chain restaurant blocklist (~70+ chains filtered out)
- Duration-aware sightseeing (full-day vs half-day attractions)
- Excursions every 3rd day with regional activities for 15 countries
- Arrival time awareness (late arrivals get rest, not sightseeing)
- Google Maps links on every activity

**Trip Summary**
- Activity counts (sights, restaurants, excursions, photo spots)
- Selected flight details and estimated cost

**Browse & Explore**
- Country pages with city grids
- City detail pages with sights, food, and photo tabs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Deployment**: Vercel

## Free APIs Used

No API keys required:
- **Wikipedia API** — sights, photos, excursions
- **Overpass API / OpenStreetMap** — restaurants, excursions
- **REST Countries API** — country search
- **OpenDataSoft / CountriesNow** — city lookups
- **Nominatim** — geocoding

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx                    # Homepage
    plan/page.tsx               # Trip planner (main feature)
    country/[code]/page.tsx     # Country page
    city/[name]/page.tsx        # City detail page
    api/
      itinerary/route.ts        # Core backend (~1900 lines)
      attractions/route.ts      # City attractions
      countries/route.ts        # REST Countries proxy
      cities/route.ts           # City lookup
      city-details/route.ts     # Wikipedia city details
  components/
    Navbar.tsx                  # Sticky navigation
  data/
    curated-restaurants.ts      # Hand-picked restaurants for 12 cities
    destinations.ts             # Destination data
  lib/
    api.ts                      # Client-side API helpers
```

## Deployment

Deployed on Vercel with auto-deploys from the `main` branch. Push to `main` and Vercel handles the rest.
