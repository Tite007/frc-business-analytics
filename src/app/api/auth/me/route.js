// Proxy current user endpoint - connects to real FRC backend
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying get current user to backend:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Backend connection failed",
        message: error.message,
        backend_url: BACKEND_URL,
      },
      { status: 503 }
    );
  }
}
