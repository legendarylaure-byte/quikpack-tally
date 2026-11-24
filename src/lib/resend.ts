const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendUserInvite({
  to,
  fullName,
  role,
  resetUrl,
}: {
  to: string;
  fullName: string;
  role: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from = process.env.EMAIL_FROM || "QUIKPACK Tally <onboarding@resend.dev>";
  const expiresNote = "This link expires soon. If it expires, ask your admin to resend it.";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f1d58">
      <h2>Welcome to quikpack Tally</h2>
      <p>Hello ${escapeHtml(fullName)},</p>
      <p>Your administrator has approved your access with the role <strong>${escapeHtml(role)}</strong>.</p>
      <p><a href="${escapeHtml(resetUrl)}" style="background:#7dbd17;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Set your password</a></p>
      <p>${escapeHtml(expiresNote)}</p>
      <p>If you did not expect this invitation, you can ignore this email.</p>
      <hr />
      <p style="font-size:12px;color:#666">S M QUIKPACK GLOBAL LIMITED COMPANY · Powered by quikpack</p>
    </div>
  `;

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your quikpack Tally access is ready",
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Invite email could not be sent (${response.status}).`);
  }
}
