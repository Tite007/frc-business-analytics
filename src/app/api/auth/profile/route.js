// Proxy profile endpoint - connects to real FRC backend
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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

// PUT /api/auth/profile - Update profile endpoint via real backend
export async function PUT(request) {
  try {
    const profileData = await request.json();
    const backendUrl = `${BACKEND_URL}/api/auth/profile`;
    console.log(`Proxying profile update request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Forward authorization header if present
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization"),
        }),
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Profile update failed",
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
    console.error("Error proxying profile update to backend:", error);

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
