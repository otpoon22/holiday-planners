import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,cca2,flags,capital,region,subregion,population,languages,currencies`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();

    const countries = data.slice(0, 20).map((c: Record<string, unknown>) => {
      const nameObj = c.name as { common: string };
      const flagsObj = c.flags as { svg: string };
      const langs = c.languages as Record<string, string> | undefined;
      const currs = c.currencies as Record<string, { name: string; symbol: string }> | undefined;

      return {
        name: nameObj.common,
        code: c.cca2 as string,
        flag: flagsObj.svg,
        capital: (c.capital as string[])?.[0] || "N/A",
        region: c.region as string,
        subregion: c.subregion as string || "",
        population: c.population as number,
        languages: langs ? Object.values(langs) : [],
        currencies: currs
          ? Object.values(currs).map(
              (cur) => `${cur.name} (${cur.symbol})`
            )
          : [],
      };
    });

    return NextResponse.json(countries);
  } catch {
    return NextResponse.json([]);
  }
}
