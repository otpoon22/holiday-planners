import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  const country = request.nextUrl.searchParams.get("country");

  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  try {
    const searchTerm = country ? `${city}, ${country}` : city;

    // Get Wikipedia summary and image
    const [wikiRes, coordRes] = await Promise.all([
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=1`,
        {
          headers: { "User-Agent": "HolidayPlannerApp/1.0" },
          next: { revalidate: 86400 },
        }
      ),
    ]);

    let description = `Discover the beauty and culture of ${city}.`;
    let imageUrl: string | null = null;
    let latitude = 0;
    let longitude = 0;

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract) {
        description = wikiData.extract;
      }
      if (wikiData.thumbnail?.source) {
        imageUrl = wikiData.thumbnail.source.replace(/\/\d+px-/, "/800px-");
      } else if (wikiData.originalimage?.source) {
        imageUrl = wikiData.originalimage.source;
      }
    }

    if (coordRes.ok) {
      const coordData = await coordRes.json();
      if (coordData.length > 0) {
        latitude = parseFloat(coordData[0].lat);
        longitude = parseFloat(coordData[0].lon);
      }
    }

    return NextResponse.json({
      name: city,
      country: country || "",
      description,
      imageUrl,
      latitude,
      longitude,
    });
  } catch {
    return NextResponse.json({
      name: city,
      country: country || "",
      description: `Discover the beauty and culture of ${city}.`,
      imageUrl: null,
      latitude: 0,
      longitude: 0,
    });
  }
}
