import { NextResponse } from "next/server";

const BACKEND_URL = "https://dashboard.researchfrc.com";

export async function GET(request, { params }) {
  try {
    const { path } = params;
    const searchParams = request.nextUrl.searchParams;

    // Reconstruct the full path
    const fullPath = Array.isArray(path) ? path.join("/") : path;

    // Build the target URL
    let targetUrl = `${BACKEND_URL}/api/frc/${fullPath}`;

    // Add query parameters if they exist
    if (searchParams.toString()) {
      targetUrl += `?${searchParams.toString()}`;
    }

    console.log("Proxying request to:", targetUrl);

    // Make the request to the backend
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the data with proper CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", message: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
