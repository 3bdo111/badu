import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/db";

export async function GET() {
  try {
    const db = await getDb();
    await db.get("SELECT 1");

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Database connectivity check failed",
      },
      { status: 503 }
    );
  }
}
