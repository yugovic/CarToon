import { NextResponse } from "next/server";

import { getGallery } from "@/lib/storage";

export async function GET() {
  try {
    const items = await getGallery(60);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ items: [] });
  }
}
