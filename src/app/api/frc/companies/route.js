// Proxy API route for companies - connects to real FRC backend
import { NextResponse } from "next/server";

// Normalize the backend URL by removing trailing slash
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dashboard.researchfrc.com"
).replace(/\/$/, "");

// Helper function to create CORS headers
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// OPTIONS handler for preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

// GET /api/frc/companies - Get all companies from real backend
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Forward all search parameters to the backend
  const backendUrl = new URL("/api/frc/companies", BACKEND_URL);
  searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  try {
    console.log(`Proxying request to: ${backendUrl.toString()}`);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward authorization header if present
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization"),
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: getCorsHeaders(),
    });
  } catch (error) {
    console.error("Error proxying to backend:", error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: "Backend connection failed",
        message: error.message,
        backend_url: BACKEND_URL,
      },
      {
        status: 503,
        headers: getCorsHeaders(),
      }
    );
  }
}
