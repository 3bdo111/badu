import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/db";

export async function GET() {
  try {
    const db = await getDb();
    const tableCheck = await db.get<{ count: number }>("SELECT count(*) as count FROM products");

    const isReady = tableCheck !== undefined;

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
