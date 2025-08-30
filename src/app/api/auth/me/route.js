// Proxy current user endpoint - connects to real FRC backend
import { NextResponse } from "next/server";

// Normalize the backend URL by removing trailing slash
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
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

// GET /api/auth/me - Get current user via real backend
export async function GET(request) {
  try {
    const backendUrl = `${BACKEND_URL}/api/auth/me`;
    console.log(`Proxying get current user request to: ${backendUrl}`);

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
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Authentication failed",
        },
        { 
          status: response.status,
          headers: getCorsHeaders()
        }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error("Error proxying get current user to backend:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Backend connection failed",
        message: error.message,
        backend_url: BACKEND_URL,
      },
      { 
        status: 503,
        headers: getCorsHeaders()
      }
    );
  }
}
