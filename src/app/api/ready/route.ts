import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function GET() {
  try {
    const tableCheck = db.prepare(`
      SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='products'
    `).get() as { count: number };

    const isReady = tableCheck && tableCheck.count > 0;

    if (isReady) {
      return NextResponse.json(
        {
          status: "ready",
          database: true,
          schema: true,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "not_ready",
        database: false,
        schema: false,
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Readiness check failed",
      },
      { status: 503 }
    );
  }
}
