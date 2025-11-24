import { NextResponse } from "next/server";

import { getGallery } from "@/lib/store";

export async function GET() {
  const items = getGallery();
  return NextResponse.json({ items });
}
