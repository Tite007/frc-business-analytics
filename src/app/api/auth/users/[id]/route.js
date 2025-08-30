// Proxy API route for individual user operations - connects to real FRC backend
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// GET /api/auth/users/[id] - Get specific user from real backend
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const backendUrl = `${BACKEND_URL}/api/auth/users/${id}`;
    console.log(`Proxying get user request to: ${backendUrl}`);

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
    console.error(`Error proxying get user ${id} to backend:`, error);

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

// PUT /api/auth/users/[id] - Update user via real backend
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const updateData = await request.json();
    const backendUrl = `${BACKEND_URL}/api/auth/users/${id}`;
    console.log(`Proxying update user request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Forward authorization header if present
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization"),
        }),
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying update user ${id} to backend:`, error);

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

// DELETE /api/auth/users/[id] - Delete user via real backend
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const backendUrl = `${BACKEND_URL}/api/auth/users/${id}`;
    console.log(`Proxying delete user request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "DELETE",
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
    console.error(`Error proxying delete user ${id} to backend:`, error);

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
