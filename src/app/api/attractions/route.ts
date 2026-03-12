import { NextRequest, NextResponse } from "next/server";
import { CURATED_RESTAURANTS } from "@/data/curated-restaurants";

const WIKI_HEADERS = { "User-Agent": "GardenLeaversTravelGuide/1.0" };
const WIKI_BASE = "https://en.wikipedia.org/w/api.php";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const kind = request.nextUrl.searchParams.get("kind") || "sights";
  const city = request.nextUrl.searchParams.get("city") || "";
  const country = request.nextUrl.searchParams.get("country") || "";

  if (!lat || !lon) {
    return NextResponse.json([]);
  }

  if (kind === "foods") {
    return await getFoodPlaces(parseFloat(lat), parseFloat(lon), city, country);
  }
  if (kind === "photos") {
    return await getPhotoSpots(parseFloat(lat), parseFloat(lon), city);
  }
  return await getSights(parseFloat(lat), parseFloat(lon), city);
}

async function getSights(lat: number, lon: number, city: string) {
  try {
    const citySlug = city.replace(/ /g, "_");

    // Gather candidates from Wikipedia categories + activity-focused searches
    const [geoResults, categoryResults, subCategoryResults, searchResults] = await Promise.all([
      // Source 1: GeoSearch — articles near the coordinates
      fetchJson(
        `${WIKI_BASE}?action=query&list=geosearch&gsradius=10000&gscoord=${lat}|${lon}&gslimit=50&format=json`
      ).then((d) =>
        (d?.query?.geosearch || []).map((a: { title: string }) => a.title)
      ),

      // Source 2: Categories — "Tourist/Visitor attractions in [City]"
      Promise.all([
        fetchJson(
          `${WIKI_BASE}?action=query&list=categorymembers&cmtitle=Category:Tourist_attractions_in_${encodeURIComponent(citySlug)}&cmlimit=50&cmtype=page&format=json`
        ).then((d) =>
          (d?.query?.categorymembers || []).map((m: { title: string }) => m.title)
        ),
        fetchJson(
          `${WIKI_BASE}?action=query&list=categorymembers&cmtitle=Category:Visitor_attractions_in_${encodeURIComponent(citySlug)}&cmlimit=50&cmtype=page&format=json`
        ).then((d) =>
          (d?.query?.categorymembers || []).map((m: { title: string }) => m.title)
        ),
      ]).then((arrays) => arrays.flat()),

      // Source 2: Sub-categories — places and activities
      Promise.all(
        [
          "Landmarks", "Museums", "Parks", "Towers", "Bridges",
          "Churches", "Cathedrals", "Palaces", "Castles",
          "Monuments_and_memorials", "Squares", "Gardens",
          "Buildings_and_structures", "Beaches", "Markets",
          "Temples", "Shrines", "Shopping_malls", "Shopping_centres",
          "Amusement_parks", "Theme_parks", "Zoos", "Aquariums",
          "Theatres", "Concert_halls", "Sports_venues",
          "Hiking_trails", "Nature_reserves",
        ].map((type) =>
          fetchJson(
            `${WIKI_BASE}?action=query&list=categorymembers&cmtitle=Category:${type}_in_${encodeURIComponent(citySlug)}&cmlimit=20&cmtype=page&format=json`
          ).then((d) =>
            (d?.query?.categorymembers || []).map(
              (m: { title: string }) => m.title
            )
          )
        )
      ).then((arrays) => arrays.flat()),

      // Source 3: Activity-focused search queries
      Promise.all(
        [
          `${city} things to do sightseeing`,
          `${city} theme park amusement`,
          `${city} viewpoint observation deck`,
          `${city} museum gallery`,
          `${city} temple shrine mosque`,
          `${city} hiking trail nature`,
          `${city} shopping mall district`,
          `${city} beach waterfront promenade`,
          `${city} landmark monument tower statue`,
          `${city} palace castle garden`,
          `${city} famous tourist attraction must visit`,
          `${city} mountain cable car`,
        ].map((q) =>
          fetchJson(
            `${WIKI_BASE}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=0&srlimit=8&format=json`
          ).then((d) =>
            (d?.query?.search || []).map((s: { title: string }) => s.title)
          )
        )
      ).then((arrays) => arrays.flat()),
    ]);

    // Merge and deduplicate all titles
    const allTitles = new Set<string>();
    [...geoResults, ...categoryResults, ...subCategoryResults, ...searchResults].forEach((t: string) => {
      allTitles.add(t);
    });

    if (allTitles.size === 0) return NextResponse.json([]);

    // Quick title-level filter for obvious junk
    const skipTitle = (t: string) => {
      if (t.toLowerCase() === city.toLowerCase()) return true;
      if (/^(list|lists|template|category|timeline|history|tourism|culture|geography|politics|economy|climate|transport|education|demographics) (of|in)/i.test(t)) return true;
      if (/\(film\)|\(band\)|\(novel\)|\(album\)|\(TV series\)|\(song\)|\(company\)|\(video game\)|\(disambiguation\)/i.test(t)) return true;
      if (/^(British|French|Dutch|Japanese|Spanish|Portuguese|colonial|empire|kingdom|republic|handover|occupation|invasion|battle|siege|war|revolt|revolution|protest|riot|massacre|bombing|attack|election|crisis)\b/i.test(t)) return true;
      if (/\b(F\.?C\.?|S\.?C\.?|championship|league|tournament|cup)\b/i.test(t)) return true;
      if (/\b(airport|university|college|hospital|prison|prostitution|crime|poverty|pollution)\b/i.test(t)) return true;
      if (/^\d{4}\b/i.test(t)) return true;
      return false;
    };

    const filteredTitles = [...allTitles].filter((t) => !skipTitle(t));
    if (filteredTitles.length === 0) return NextResponse.json([]);

    // Fetch pageviews + descriptions + images in batches of 20
    const batches: string[][] = [];
    for (let i = 0; i < filteredTitles.length; i += 20) {
      batches.push(filteredTitles.slice(i, i + 20));
    }

    const allPages: Record<string, unknown>[] = [];
    for (const batch of batches) {
      const titlesParam = batch.join("|");
      const data = await fetchJsonPost(
        `${WIKI_BASE}`,
        `action=query&titles=${encodeURIComponent(titlesParam)}&prop=pageviews|description|coordinates|pageimages&pvipdays=30&pithumbsize=400&format=json`
      );
      if (data?.query?.pages) {
        allPages.push(...Object.values(data.query.pages) as Record<string, unknown>[]);
      }
    }

    // Rough distance calculator
    const distKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Allowlist: description patterns that indicate a REAL visitable place or activity
    const isVisitablePlace = (desc: string) =>
      /museum|gallery|exhibition|art centre/i.test(desc) ||
      /park|garden|botanical|zoo|aquarium|wildlife/i.test(desc) ||
      /theme park|amusement|disneyland|waterpark|adventure/i.test(desc) ||
      /temple|shrine|church|cathedral|basilica|mosque|chapel|monastery/i.test(desc) ||
      /palace|castle|château|fort(?:ress)?/i.test(desc) ||
      /tower|observation|viewpoint|skyscraper|deck/i.test(desc) ||
      /bridge|monument|statue|memorial|fountain|gate|arch|obelisk/i.test(desc) ||
      /square|plaza|piazza|promenade|waterfront|boardwalk|boulevard|avenue/i.test(desc) ||
      /market|bazaar|souk|mall|shopping|shopping centre/i.test(desc) ||
      /beach|bay|harbour|harbor|pier|wharf|marina/i.test(desc) ||
      /mountain|peak|hill|viewpoint|hiking|trail|canyon|gorge|cliff|waterfall/i.test(desc) ||
      /island|peninsula|lake|river cruise|reservoir/i.test(desc) ||
      /theatre|theater|opera house|concert hall|arena|stadium|venue/i.test(desc) ||
      /cable car|gondola|funicular|ferris wheel|tram/i.test(desc) ||
      /historic|heritage|landmark|tourist|attraction|scenic|famous/i.test(desc) ||
      /cabaret|nightlife|entertainment|cinema/i.test(desc) ||
      /neighborhood|neighbourhood|quarter|district.*known for|area.*popular/i.test(desc) ||
      /swimming|snorkeling|diving|surfing|kayak|boat|cruise|sailing/i.test(desc) ||
      /street.*in\b|road.*in\b|steps.*in\b|stairway/i.test(desc) ||
      /building.*in\b|structure.*in\b|complex.*in\b/i.test(desc) ||
      /cave|grotto|underground|tunnel/i.test(desc) ||
      /ossuary|catacombs|mausoleum|tomb(?!.*pharaoh)/i.test(desc);

    // Score and rank
    const results = allPages
      .filter((p) => {
        if ((p as { missing?: boolean }).missing) return false;
        const title = (p as { title: string }).title || "";
        const desc = ((p as { description?: string }).description || "").toLowerCase();

        // Hard block: things that should NEVER appear
        if (/colony|colonial|occupation|handover|transfer|sovereignty|treaty/i.test(desc)) return false;
        if (/war|battle|invasion|military|armed forces|army|navy/i.test(desc)) return false;
        if (/prostitution|crime|murder|corruption|scandal|controversy/i.test(desc)) return false;
        if (/company|corporation|conglomerate|firm|brand|software/i.test(desc)) return false;
        if (/person|born \d|died \d|footballer|athlete|actor|singer|writer|politician/i.test(desc)) return false;
        if (/film|album|song|novel|tv|series|band|video game/i.test(desc)) return false;
        if (/sports? (club|team|league)|football|soccer|rugby|cricket/i.test(desc)) return false;
        if (/university|college|school|academy|hospital|prison/i.test(desc)) return false;
        if (/airport|airline|railway|bus terminal|metro system/i.test(desc)) return false;
        if (/municipality|prefecture|province|county|department|region of/i.test(desc)) return false;
        if (/monarchy|empire|kingdom|republic|dynasty/i.test(desc)) return false;
        if (/religion[^s]|deity|mythology|patroness|doctrine/i.test(desc)) return false;
        if (/period|era|epoch|movement|ideology|philosophy|style of/i.test(desc)) return false;
        if (/government|agency|bureau|ministry|political|parliament/i.test(desc)) return false;
        if (/syndrome|symbol|concept|theory|abstract|phenomenon/i.test(desc)) return false;
        if (/language|dialect|ethnic|ethnicity|demographic/i.test(desc)) return false;
        if (/newspaper|magazine|publication|broadcast|radio|television/i.test(desc)) return false;

        // Must be a visitable place (allowlist check)
        if (!isVisitablePlace(desc) && !isVisitablePlace(title.toLowerCase())) return false;

        // Distance check: coordinates must be within 80km of city
        const coords = (p as { coordinates?: { lat: number; lon: number }[] }).coordinates;
        if (coords?.[0]) {
          if (distKm(lat, lon, coords[0].lat, coords[0].lon) > 80) return false;
        } else {
          // No coordinates — only keep if title or description mentions the city
          const cityLower = city.toLowerCase();
          if (!title.toLowerCase().includes(cityLower) && !desc.includes(cityLower)) return false;
        }
        return true;
      })
      .map((p) => {
        const page = p as {
          title: string;
          description?: string;
          pageviews?: Record<string, number | null>;
          coordinates?: { lat: number; lon: number }[];
          thumbnail?: { source: string };
        };

        const views = Object.values(page.pageviews || {}).reduce(
          (sum: number, v) => sum + (v || 0),
          0
        );

        const desc = page.description || "";
        const descLower = desc.toLowerCase();
        const titleLower = page.title.toLowerCase();
        const combined = descLower + " " + titleLower;

        let category = "Attraction";
        if (/museum|gallery|exhibition/i.test(combined)) category = "Museum";
        else if (/theme park|amusement|disneyland|waterpark/i.test(combined)) category = "Theme Park";
        else if (/church|cathedral|basilica|mosque|chapel/i.test(combined)) category = "Temple / Church";
        else if (/temple|shrine|monastery/i.test(combined)) category = "Temple / Church";
        else if (/palace|castle|château|fort(?:ress)?/i.test(combined)) category = "Palace";
        else if (/park|garden|botanical|nature|reserve/i.test(combined)) category = "Park & Garden";
        else if (/tower|observation|skyscraper|deck/i.test(combined)) category = "Landmark";
        else if (/bridge|monument|statue|memorial|fountain|gate|arch/i.test(combined)) category = "Landmark";
        else if (/square|plaza|piazza/i.test(combined)) category = "Square";
        else if (/market|bazaar|souk|mall|shopping/i.test(combined)) category = "Shopping";
        else if (/beach|bay|waterfront|pier|harbour|harbor/i.test(combined)) category = "Beach";
        else if (/mountain|peak|hill|hiking|trail|viewpoint/i.test(combined)) category = "Nature";
        else if (/zoo|aquarium|wildlife/i.test(combined)) category = "Zoo & Aquarium";
        else if (/theatre|theater|opera|cabaret|cinema/i.test(combined)) category = "Entertainment";
        else if (/island|lake|waterfall|cave|canyon/i.test(combined)) category = "Nature";
        else if (/cable car|gondola|funicular|ferris wheel/i.test(combined)) category = "Experience";
        else if (/street|road|steps|stairway|promenade|boulevard/i.test(combined)) category = "Landmark";
        else if (/cemetery|crypt|catacombs|ossuary/i.test(combined)) category = "Landmark";

        return {
          name: page.title,
          category,
          description: desc,
          imageUrl: page.thumbnail?.source || null,
          latitude: page.coordinates?.[0]?.lat || lat,
          longitude: page.coordinates?.[0]?.lon || lon,
          pageviews: views,
          wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
        };
      })
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 10);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}

async function getPhotoSpots(lat: number, lon: number, city: string) {
  try {
    // Source 1: Overpass — viewpoints, observation towers, beaches, scenic spots
    const overpassResults = await (async () => {
      for (const radius of [10000, 5000]) {
        try {
          const query = `[out:json][timeout:15];(
            node["tourism"="viewpoint"](around:${radius},${lat},${lon});
            node["tower:type"="observation"](around:${radius},${lat},${lon});
            node["man_made"="observation_tower"](around:${radius},${lat},${lon});
            node["natural"="beach"]["name"](around:${radius},${lat},${lon});
            node["natural"="peak"]["name"](around:${radius},${lat},${lon});
            node["leisure"="park"]["name"](around:${radius},${lat},${lon});
            node["amenity"="bar"]["rooftop"="yes"](around:${radius},${lat},${lon});
            node["building"="observation"](around:${radius},${lat},${lon});
          );out body 80;`;
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
            next: { revalidate: 86400 },
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (data.remark?.includes("timed out")) continue;
          return data.elements || [];
        } catch {
          continue;
        }
      }
      return [];
    })();

    // Source 2: Wikipedia — scenic/photo locations
    const citySlug = city.replace(/ /g, "_");
    const wikiResults = await Promise.all([
      // Categories
      ...["Beaches", "Parks", "Gardens", "Viewpoints", "Observation_towers"].map((type) =>
        fetchJson(
          `${WIKI_BASE}?action=query&list=categorymembers&cmtitle=Category:${type}_in_${encodeURIComponent(citySlug)}&cmlimit=20&cmtype=page&format=json`
        ).then((d) =>
          (d?.query?.categorymembers || []).map((m: { title: string }) => m.title)
        )
      ),
      // Searches
      ...[
        `${city} viewpoint observation deck panoramic`,
        `${city} rooftop bar skyline view`,
        `${city} beach scenic sunset`,
        `${city} mountain hiking view`,
        `${city} harbour waterfront promenade`,
        `${city} park garden scenic`,
      ].map((q) =>
        fetchJson(
          `${WIKI_BASE}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=0&srlimit=8&format=json`
        ).then((d) =>
          (d?.query?.search || []).map((s: { title: string }) => s.title)
        )
      ),
    ]).then((arrays) => arrays.flat());

    // Process Overpass results
    const seen = new Set<string>();
    const overpassSpots = overpassResults
      .filter((el: Record<string, unknown>) => {
        const tags = el.tags as Record<string, string> | undefined;
        const name = tags?.name || tags?.["name:en"] || "";
        if (!name) return false;
        const key = name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((el: Record<string, unknown>) => {
        const tags = el.tags as Record<string, string>;
        const localName = tags.name || "";
        const englishName = tags["name:en"] || "";
        const hasNonLatin = /[^\u0000-\u024F\u1E00-\u1EFF]/.test(localName);

        let displayName: string;
        if (!hasNonLatin) displayName = localName;
        else if (englishName) displayName = `${englishName} (${localName})`;
        else displayName = localName;

        let category = "Viewpoint";
        if (tags.natural === "beach") category = "Beach";
        else if (tags.natural === "peak") category = "Mountain View";
        else if (tags.leisure === "park") category = "Park";
        else if (tags.rooftop === "yes" || tags.amenity === "bar") category = "Rooftop";
        else if (tags["tower:type"] === "observation" || tags.man_made === "observation_tower")
          category = "Observation Deck";

        return {
          name: displayName,
          category,
          description: tags.description || tags.note || "",
          imageUrl: null as string | null,
          latitude: el.lat as number,
          longitude: el.lon as number,
          score: 5,
        };
      });

    // Process Wikipedia results — fetch descriptions + images
    const wikiTitles = [...new Set(wikiResults)].filter((t) => {
      const tl = t.toLowerCase();
      if (tl === city.toLowerCase()) return false;
      if (/^(list|history|tourism|culture|geography|climate|transport) (of|in)/i.test(t)) return false;
      if (/\(film\)|\(song\)|\(album\)|\(TV series\)|\(company\)/i.test(t)) return false;
      return true;
    });

    const distKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const isPhotoWorthy = (desc: string) =>
      /viewpoint|observation|panoram|scenic|overlook/i.test(desc) ||
      /rooftop|skyline|sky bar|sky deck|sky lounge/i.test(desc) ||
      /beach|bay|coast|waterfront|promenade|pier|harbour|harbor|marina/i.test(desc) ||
      /mountain|peak|hill|cliff|canyon|gorge|waterfall|volcano/i.test(desc) ||
      /park|garden|botanical|nature|reserve|trail/i.test(desc) ||
      /tower|skyscraper|observation deck|deck/i.test(desc) ||
      /bridge|monument|statue|landmark|gate|arch/i.test(desc) ||
      /lake|river|island|peninsula|reservoir/i.test(desc) ||
      /temple|shrine|palace|castle/i.test(desc) ||
      /sunset|sunrise|view/i.test(desc) ||
      /cable car|gondola|funicular|ferris wheel/i.test(desc) ||
      /square|plaza|piazza/i.test(desc);

    let wikiSpots: { name: string; category: string; description: string; imageUrl: string | null; latitude: number; longitude: number; score: number }[] = [];

    if (wikiTitles.length > 0) {
      const batches: string[][] = [];
      for (let i = 0; i < wikiTitles.length; i += 20) {
        batches.push(wikiTitles.slice(i, i + 20));
      }

      const allPages: Record<string, unknown>[] = [];
      for (const batch of batches) {
        const data = await fetchJsonPost(
          `${WIKI_BASE}`,
          `action=query&titles=${encodeURIComponent(batch.join("|"))}&prop=pageviews|description|coordinates|pageimages&pvipdays=30&pithumbsize=400&format=json`
        );
        if (data?.query?.pages) {
          allPages.push(...Object.values(data.query.pages) as Record<string, unknown>[]);
        }
      }

      wikiSpots = allPages
        .filter((p) => {
          if ((p as { missing?: boolean }).missing) return false;
          const desc = ((p as { description?: string }).description || "").toLowerCase();
          const title = ((p as { title: string }).title || "").toLowerCase();
          // Block non-scenic articles
          if (/company|corporation|film|album|song|band|person|born \d|died \d/i.test(desc)) return false;
          if (/war|battle|military|occupation|colony|handover|political|government/i.test(desc)) return false;
          if (/university|college|school|hospital|airport|prison/i.test(desc)) return false;
          if (/municipality|prefecture|province|county|district|region of/i.test(desc)) return false;
          if (/sports? (club|team)|football|soccer|cricket/i.test(desc)) return false;
          // Must be photo-worthy
          if (!isPhotoWorthy(desc) && !isPhotoWorthy(title)) return false;
          // Distance check
          const coords = (p as { coordinates?: { lat: number; lon: number }[] }).coordinates;
          if (coords?.[0]) {
            if (distKm(lat, lon, coords[0].lat, coords[0].lon) > 80) return false;
          } else {
            const cityLower = city.toLowerCase();
            if (!title.includes(cityLower) && !desc.includes(cityLower)) return false;
          }
          return true;
        })
        .map((p) => {
          const page = p as {
            title: string;
            description?: string;
            pageviews?: Record<string, number | null>;
            coordinates?: { lat: number; lon: number }[];
            thumbnail?: { source: string };
          };
          const views = Object.values(page.pageviews || {}).reduce(
            (sum: number, v) => sum + (v || 0), 0
          );
          const desc = page.description || "";
          const combined = (desc + " " + page.title).toLowerCase();

          let category = "Scenic Spot";
          if (/viewpoint|observation|panoram|overlook|deck/i.test(combined)) category = "Viewpoint";
          else if (/rooftop|sky bar|skyline/i.test(combined)) category = "Rooftop";
          else if (/beach|coast|bay/i.test(combined)) category = "Beach";
          else if (/mountain|peak|hill|volcano|cliff/i.test(combined)) category = "Mountain View";
          else if (/park|garden|botanical/i.test(combined)) category = "Park";
          else if (/tower|skyscraper/i.test(combined)) category = "Observation Deck";
          else if (/bridge|monument|statue|gate|arch/i.test(combined)) category = "Landmark";
          else if (/lake|waterfall|river|island/i.test(combined)) category = "Nature";
          else if (/temple|shrine|palace|castle/i.test(combined)) category = "Heritage";
          else if (/cable car|gondola|funicular|ferris wheel/i.test(combined)) category = "Experience";

          const alreadySeen = seen.has(page.title.toLowerCase().trim());
          if (alreadySeen) return null;
          seen.add(page.title.toLowerCase().trim());

          return {
            name: page.title,
            category,
            description: desc,
            imageUrl: page.thumbnail?.source || null,
            latitude: page.coordinates?.[0]?.lat || lat,
            longitude: page.coordinates?.[0]?.lon || lon,
            score: Math.min(views / 1000, 20), // Normalize wiki pageviews to comparable scale
          };
        })
        .filter(Boolean) as typeof wikiSpots;
    }

    // Merge and rank — prefer wiki results (they have images) but include overpass viewpoints
    const allSpots = [...wikiSpots, ...overpassSpots]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(allSpots);
  } catch {
    return NextResponse.json([]);
  }
}

async function getFoodPlaces(lat: number, lon: number, city: string, country: string) {
  const results: { name: string; cuisine: string; description: string; website: string | null; phone: string | null; openingHours: string | null; address: string | null; latitude: number; longitude: number; score: number }[] = [];
  const seen = new Set<string>();

  // LAYER 1: Curated restaurants (always best quality)
  const curated = CURATED_RESTAURANTS[city.toLowerCase()] || [];
  for (const r of curated) {
    const key = r.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      name: r.name,
      cuisine: r.cuisine,
      description: r.description,
      website: null,
      phone: null,
      openingHours: null,
      address: r.neighbourhood || null,
      latitude: lat + (Math.random() - 0.5) * 0.01, // approximate location
      longitude: lon + (Math.random() - 0.5) * 0.01,
      score: 50 + (r.tier === "fine_dining" ? 20 : r.tier === "upscale" ? 10 : 0),
    });
  }

  // LAYER 2: Overpass as filler only if curated < 10
  if (results.length < 10) {
    for (const radius of [5000, 3000, 1500]) {
      try {
        const query = `[out:json][timeout:15];node["amenity"="restaurant"]["name"]["cuisine"](around:${radius},${lat},${lon});out body 60;`;
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          next: { revalidate: 86400 },
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.remark?.includes("timed out") || !data.elements?.length) continue;

        const overpassResults = processFood(data.elements, city, country, seen);
        // Return combined: curated first, then overpass fillers
        const combined = [...results, ...overpassResults].slice(0, 15);
        return NextResponse.json(combined);
      } catch { continue; }
    }
  }

  return NextResponse.json(results.slice(0, 15));
}

// Regional cuisine map — what food is actually LOCAL to each country/region
const REGIONAL_CUISINES: Record<string, string[]> = {
  "hong kong": ["cantonese", "chinese", "dim_sum", "congee", "noodle", "wonton", "char_siu", "roast_goose", "seafood", "cha_chaan_teng", "hong_kong", "yum_cha", "hotpot", "tea", "asian", "sichuan", "shanghainese", "japanese", "korean", "vietnamese", "thai", "malaysian", "singaporean", "taiwanese"],
  "china": ["chinese", "cantonese", "sichuan", "szechuan", "hunan", "shanghai", "beijing", "dim_sum", "dumpling", "noodle", "hotpot", "peking", "wonton", "congee", "asian"],
  "japan": ["japanese", "sushi", "ramen", "izakaya", "tempura", "yakitori", "udon", "soba", "tonkatsu", "kaiseki", "okonomiyaki", "teppanyaki", "gyudon", "donburi", "takoyaki", "asian"],
  "south korea": ["korean", "bbq", "bibimbap", "kimchi", "bulgogi", "jjigae", "samgyeopsal", "tteokbokki", "fried_chicken", "pojangmacha", "asian"],
  "korea": ["korean", "bbq", "bibimbap", "kimchi", "bulgogi", "jjigae", "samgyeopsal", "tteokbokki", "fried_chicken", "pojangmacha", "asian"],
  "taiwan": ["taiwanese", "chinese", "bubble_tea", "beef_noodle", "dumpling", "night_market", "hotpot", "bao", "asian"],
  "thailand": ["thai", "pad_thai", "curry", "tom_yum", "som_tum", "sticky_rice", "street_food", "noodle", "seafood", "isaan", "asian"],
  "vietnam": ["vietnamese", "pho", "banh_mi", "bun_cha", "spring_roll", "noodle", "seafood", "com", "asian"],
  "singapore": ["singaporean", "chinese", "malay", "indian", "hawker", "laksa", "chicken_rice", "chilli_crab", "satay", "noodle", "roti", "asian"],
  "malaysia": ["malaysian", "malay", "chinese", "indian", "nasi_lemak", "roti", "laksa", "satay", "char_kway_teow", "noodle", "asian"],
  "indonesia": ["indonesian", "nasi_goreng", "satay", "rendang", "soto", "padang", "javanese", "balinese", "seafood", "asian"],
  "philippines": ["filipino", "adobo", "sinigang", "lechon", "sisig", "kare_kare", "seafood", "asian"],
  "india": ["indian", "curry", "tandoori", "biryani", "thali", "dosa", "chaat", "mughlai", "south_indian", "north_indian", "punjabi", "bengali", "gujarati", "rajasthani", "kerala", "goan", "vegetarian"],
  "sri lanka": ["sri_lankan", "curry", "rice_and_curry", "hopper", "kottu", "seafood", "indian"],
  "turkey": ["turkish", "kebab", "meze", "pide", "lahmacun", "baklava", "doner", "kofte", "lokanta", "ottoman", "mediterranean"],
  "united arab emirates": ["emirati", "arabic", "lebanese", "persian", "middle_eastern", "shawarma", "meze", "grilled_meat", "seafood", "indian"],
  "qatar": ["arabic", "lebanese", "persian", "middle_eastern", "seafood", "grilled_meat", "indian"],
  "italy": ["italian", "pizza", "pasta", "risotto", "trattoria", "osteria", "gelato", "seafood", "mediterranean", "roman", "tuscan", "sicilian", "neapolitan"],
  "spain": ["spanish", "tapas", "paella", "pintxos", "jamon", "churros", "seafood", "mediterranean", "basque", "catalan", "andalusian"],
  "portugal": ["portuguese", "bacalhau", "pastel_de_nata", "seafood", "grilled_fish", "francesinha", "cozido", "mediterranean"],
  "greece": ["greek", "gyros", "souvlaki", "moussaka", "taverna", "mezze", "seafood", "mediterranean"],
  "croatia": ["croatian", "seafood", "grilled_meat", "mediterranean", "dalmatian", "istrian", "konoba"],
  "france": ["french", "bistro", "brasserie", "patisserie", "crêpe", "wine_bar", "provençal", "alsatian", "seafood", "mediterranean"],
  "germany": ["german", "bavarian", "bratwurst", "schnitzel", "beer_garden", "currywurst", "pretzel", "bierkeller"],
  "netherlands": ["dutch", "indonesian", "surinamese", "herring", "stroopwafel", "bitterballen", "pancake"],
  "london": ["british", "pub", "gastropub", "indian", "curry", "bangladeshi", "turkish", "lebanese", "ethiopian", "chinese", "cantonese", "dim_sum", "japanese", "ramen", "sushi", "korean", "vietnamese", "thai", "caribbean", "jamaican", "nigerian", "west_african", "persian", "afghan", "greek", "portuguese", "tapas", "seafood", "pie", "fish_and_chips", "sunday_roast", "brunch", "sourdough", "bakery", "middle_eastern", "polish", "italian"],
  "united kingdom": ["british", "pub", "fish_and_chips", "pie", "roast", "curry", "gastropub", "sunday_roast", "indian", "turkish", "chinese", "thai", "vietnamese", "korean", "caribbean", "seafood", "bakery"],
  "england": ["british", "pub", "fish_and_chips", "pie", "roast", "curry", "gastropub", "sunday_roast", "indian"],
  "mexico": ["mexican", "taco", "mole", "pozole", "tamale", "enchilada", "mezcal", "street_food", "oaxacan", "yucatecan", "seafood"],
  "brazil": ["brazilian", "churrasco", "feijoada", "açaí", "pão_de_queijo", "seafood", "baiana", "gaucho"],
  "peru": ["peruvian", "ceviche", "lomo_saltado", "anticucho", "pisco", "nikkei", "criollo", "seafood"],
  "united states": ["american", "bbq", "burger", "soul_food", "cajun", "tex_mex", "seafood", "steak", "diner", "southern"],
  "morocco": ["moroccan", "tagine", "couscous", "pastilla", "harira", "street_food", "north_african", "berber"],
  "south africa": ["south_african", "braai", "biltong", "bunny_chow", "bobotie", "cape_malay", "seafood"],
  "egypt": ["egyptian", "koshari", "ful_medames", "grilled_meat", "middle_eastern", "seafood", "arabic"],
  "australia": ["australian", "modern_australian", "seafood", "asian", "mediterranean", "bbq", "cafe", "brunch"],
  "new zealand": ["new_zealand", "seafood", "maori", "pacific", "lamb", "modern", "cafe"],
};

const WESTERN_CUISINES = [
  "italian", "pizza", "pasta", "american", "burger", "french", "german",
  "fish_and_chips", "steak_house", "sandwich", "bagel", "deli",
  "tex_mex", "british", "irish",
];

const WESTERN_COUNTRIES = new Set([
  "italy", "france", "germany", "spain", "portugal", "greece", "croatia",
  "united kingdom", "england", "scotland", "wales", "ireland", "netherlands",
  "belgium", "switzerland", "austria", "sweden", "norway", "denmark", "finland",
  "united states", "canada", "australia", "new zealand",
]);

function getLocalCuisines(city: string, country: string): string[] {
  return REGIONAL_CUISINES[city.toLowerCase()] || REGIONAL_CUISINES[country.toLowerCase()] || [];
}

function isLocalCuisine(cuisineTag: string, city: string, country: string): boolean {
  const local = getLocalCuisines(city, country);
  if (local.length === 0) return true;
  const lower = cuisineTag.toLowerCase().replace(/[;,]/g, " ");
  return local.some((c) => lower.includes(c.replace(/_/g, " ")) || lower.includes(c));
}

function isNonLocalWesternFood(cuisineTag: string, country: string): boolean {
  if (WESTERN_COUNTRIES.has(country.toLowerCase())) return false;
  const lower = cuisineTag.toLowerCase().replace(/[;,]/g, " ");
  return WESTERN_CUISINES.some((w) => lower.includes(w.replace(/_/g, " ")) || lower.includes(w));
}

// Chains and tourist traps to filter out
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

function processFood(elements: Record<string, unknown>[], city: string, country: string, existingSeen?: Set<string>) {
  const seen = existingSeen ? new Set(existingSeen) : new Set<string>();

  const results = elements
    .filter((el) => {
      const tags = el.tags as Record<string, string> | undefined;
      if (!tags?.name) return false;
      // Block chain restaurants
      const nameLower = (tags["name:en"] || tags.name).toLowerCase();
      if (CHAIN_BLOCKLIST.some((chain) => nameLower.includes(chain))) return false;
      const key = tags.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((el) => {
      const tags = el.tags as Record<string, string>;
      let score = 0;

      // TOP-TIER signals
      if (tags.wikipedia) score += 15;
      if (tags.wikidata) score += 10;
      if (tags.stars) score += 20;
      if (tags.reservation === "required") score += 8;
      if (/michelin|award|best|famous|renowned/i.test(tags.description || "")) score += 12;

      // Strong establishment signals
      if (tags.description) score += 5;
      if (tags.website) score += 4;
      if (tags.phone) score += 2;
      if (tags.opening_hours) score += 2;
      if (tags["addr:street"]) score += 1;
      if (tags.outdoor_seating === "yes") score += 2;

      const cuisine = (tags.cuisine || "").toLowerCase();
      if (/regional|local|traditional|authentic/i.test(cuisine + " " + (tags.description || ""))) score += 10;
      if (isLocalCuisine(cuisine, city, country)) score += 12;
      if (isNonLocalWesternFood(cuisine, country)) score -= 15;
      if (/international/i.test(cuisine)) score -= 8;

      // Penalise places with almost no info
      const infoCount = [tags.website, tags.phone, tags.opening_hours, tags.description, tags["addr:street"]].filter(Boolean).length;
      if (infoCount === 0) score -= 5;

      // Build a display name with English translation
      const localName = tags.name;
      const englishName = tags["name:en"] || "";
      const hasNonLatin = /[^\u0000-\u024F\u1E00-\u1EFF]/.test(localName);

      let displayName: string;
      if (!hasNonLatin) {
        // Name is already in Latin script
        displayName = localName;
      } else if (englishName) {
        // Show English name with original in brackets
        displayName = `${englishName} (${localName})`;
      } else {
        // No English translation available, use local name as-is
        displayName = localName;
      }

      return {
        name: displayName,
        cuisine: tags.cuisine || "Restaurant",
        description: tags.description || "",
        website: tags.website || null,
        phone: tags.phone || null,
        openingHours: tags.opening_hours || null,
        address: tags["addr:street"]
          ? `${tags["addr:housenumber"] ? tags["addr:housenumber"] + " " : ""}${tags["addr:street"]}`
          : tags["addr:full"] || null,
        latitude: el.lat as number,
        longitude: el.lon as number,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Hard-filter: remove non-local Western food in non-Western countries if we have enough local options
  const isNonWesternDest = !WESTERN_COUNTRIES.has(country.toLowerCase());
  let filtered = results;
  if (isNonWesternDest && country) {
    const localOnly = results.filter((f) => !isNonLocalWesternFood(f.cuisine, country));
    if (localOnly.length >= 5) {
      filtered = localOnly;
    }
  }

  return filtered.slice(0, 10);
}

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: WIKI_HEADERS,
      next: { revalidate: 86400 },
    });
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
      headers: {
        ...WIKI_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
