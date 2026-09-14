import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function GET() {
  try {
    // Quick database ping
    db.prepare("SELECT 1").get();

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
