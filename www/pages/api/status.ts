import { getApiStatus } from "../../utils/functions";
import { NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET() {
  const status = await getApiStatus();
  return NextResponse.json({ status }, { status: 200 });
}
