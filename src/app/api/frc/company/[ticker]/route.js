// Proxy API route for individual company data - connects to real FRC backend
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// GET /api/frc/company/[ticker] - Get specific company from real backend
export async function GET(request, { params }) {
  const { ticker } = params;
  const upperTicker = ticker.toUpperCase();

  // Handle CMS route confusion
  if (upperTicker === "CMS") {
    return NextResponse.json(
      {
        error: true,
        message:
          "CMS is not a valid company ticker. Did you mean to access the CMS at /cms?",
        status: 404,
        redirect: "/cms",
      },
      { status: 404 }
    );
  }

  try {
    const backendUrl = `${BACKEND_URL}/api/frc/company/${upperTicker}`;
    console.log(`Proxying request to: ${backendUrl}`);

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
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying company ${upperTicker} to backend:`, error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: true,
        message: `Company with ticker '${upperTicker}' not found or backend connection failed`,
        status: 404,
        backend_url: BACKEND_URL,
        details: error.message,
      },
      { status: 404 }
    );
  }
}
