import { NextRequest, NextResponse } from "next/server";

// Check-in links are emailed to vault owners by the backend
// (services/notification_service.py) as `{FRONTEND_URL}/api/checkin/{token}`.
// This route receives the click and forwards the token to the backend's
// public check-in endpoint: POST /api/escalation/respond/{token}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function page(title: string, body: string, status: number) {
    return new NextResponse(
        `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Check-in — Paradosis</title>
    <style>
      body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; background: #fafafa; color: #171717;
             display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 40px;
              max-width: 420px; margin: 24px; text-align: center; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      p { color: #525252; line-height: 1.6; font-size: 15px; margin: 0; }
    </style>
  </head>
  <body>
    <div class="card"><h1>${title}</h1><p>${body}</p></div>
  </body>
</html>`,
        { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const res = await fetch(`${API_URL}/api/escalation/respond/${token}`, {
            method: "POST",
        });
        if (!res.ok) throw new Error();
        return page(
            "✓ Check-in confirmed",
            "Thank you for confirming you're okay. Your vault escalation status has been reset to normal. You can close this window.",
            200
        );
    } catch {
        return page(
            "Invalid check-in link",
            "This link is invalid or has expired. If a new check-in was sent to your email, use that one instead.",
            404
        );
    }
}
