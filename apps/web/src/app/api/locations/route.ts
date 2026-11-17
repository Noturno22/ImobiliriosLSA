import { NextResponse } from "next/server";
import { getMunicipalities, getNeighborhoods } from "@/lib/properties";

export const dynamic = "force-dynamic";

/**
 * GET /api/locations?province=Luanda&municipality=Belas
 * Returns distinct municipalities and neighborhoods for cascading selects.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province")?.trim() || undefined;
  const municipality = searchParams.get("municipality")?.trim() || undefined;

  const [municipalities, neighborhoods] = await Promise.all([
    getMunicipalities(province),
    municipality ? getNeighborhoods(province, municipality) : Promise.resolve([]),
  ]);

  return NextResponse.json({ municipalities, neighborhoods });
}
