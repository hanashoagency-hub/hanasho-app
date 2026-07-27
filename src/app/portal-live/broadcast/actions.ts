"use server";

import * as React from "react";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { getAdminClient } from "@/utils/certificates";
import BroadcastEmail from "@/emails/BroadcastEmail";

// Gmail hard-limits ~500 recipients/day on a standard account. Batching
// with a delay keeps sending smooth and under per-minute throttles.
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 2000;

interface Recipient {
  email: string;
  name: string;
  provider: string;
}

export async function getBroadcastRecipientsAction(filter: "google" | "all") {
  try {
    const admin = getAdminClient();
    const recipients: Recipient[] = [];
    let page = 1;

    // listUsers is paginated; loop until a short page.
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
      if (error) throw new Error(error.message);
      const users = data?.users || [];

      for (const u of users) {
        if (!u.email) continue;
        const providers: string[] = (u.app_metadata?.providers as string[]) || [u.app_metadata?.provider || "email"];
        const isGoogle = providers.includes("google");
        if (filter === "google" && !isGoogle) continue;
        recipients.push({
          email: u.email,
          name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || "",
          provider: isGoogle ? "google" : providers[0] || "email",
        });
      }

      if (users.length < 500) break;
      page++;
    }

    return { success: true, recipients };
  } catch (error: any) {
    console.error("Broadcast Recipients Fetch Error:", error);
    return { success: false, recipients: [] as Recipient[], error: error.message };
  }
}

export async function sendBroadcastAction(params: {
  subject: string;
  message: string;
  filter: "google" | "all";
}) {
  try {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT?.trim() || 587);
    const smtpUser = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    if (!host || !smtpUser || !pass) {
      return { success: false, sent: 0, failed: 0, error: "Email (SMTP) is not configured on the server." };
    }

    const { recipients } = await getBroadcastRecipientsAction(params.filter);
    if (recipients.length === 0) {
      return { success: false, sent: 0, failed: 0, error: "No recipients matched the selected filter." };
    }

    const transporter = nodemailer.createTransport({
      host, port, secure: port === 465,
      auth: { user: smtpUser, pass },
    });
    const from = process.env.EMAIL_FROM?.trim() || smtpUser;

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (r) => {
        try {
          const html = await render(
            React.createElement(BroadcastEmail, {
              firstName: r.name.split(" ")[0] || "there",
              subject: params.subject,
              message: params.message,
            })
          );
          await transporter.sendMail({ from, to: r.email, subject: params.subject, html });
          sent++;
        } catch (err) {
          failed++;
          console.error(`[broadcast] Failed to send to ${r.email}:`, err);
        }
      }));
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    return { success: true, sent, failed, total: recipients.length };
  } catch (error: any) {
    console.error("Broadcast Send Error:", error);
    return { success: false, sent: 0, failed: 0, error: error.message };
  }
}
