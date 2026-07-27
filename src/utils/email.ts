import nodemailer, { type Transporter } from "nodemailer";
import { render } from "@react-email/render";
import * as React from "react";
import TelegramAccessEmail from "@/emails/TelegramAccessEmail";
import WelcomeEmail from "@/emails/WelcomeEmail";
import PurchaseReceiptEmail from "@/emails/PurchaseReceiptEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import VerificationEmail from "@/emails/VerificationEmail";

// Server-only. Every function here swallows its own errors and never
// throws — a failed/unconfigured email must never break the action that
// triggered it (a purchase, a signup, ...).

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    console.warn("[email] SMTP is not fully configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — skipping email send.");
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

function getFrom(): string {
  return process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "HanHub Academy";
}

async function send(to: string, subject: string, element: React.ReactElement, tag: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    const html = await render(element);
    await transporter.sendMail({ from: getFrom(), to, subject, html });
  } catch (err) {
    console.error(`[email] Failed to send ${tag} email:`, err);
  }
}

export async function sendTelegramAccessEmail(params: {
  to: string;
  firstName: string;
  courseTitle: string;
  channelInviteLink: string;
  groupInviteLink: string;
}) {
  await send(
    params.to,
    "Welcome to HanHub Academy 🎉",
    React.createElement(TelegramAccessEmail, params),
    "telegram-access"
  );
}

export async function sendWelcomeEmail(params: { to: string; firstName: string }) {
  await send(
    params.to,
    "Welcome to HanHub Academy",
    React.createElement(WelcomeEmail, params),
    "welcome"
  );
}

export async function sendPurchaseReceipt(params: {
  to: string;
  firstName: string;
  itemTitle: string;
  amount: number;
  currency: string;
  referenceId: string;
}) {
  await send(
    params.to,
    `Receipt: ${params.itemTitle}`,
    React.createElement(PurchaseReceiptEmail, params),
    "purchase-receipt"
  );
}

export async function sendPasswordReset(params: { to: string; firstName: string; resetLink: string }) {
  await send(
    params.to,
    "Reset your HanHub password",
    React.createElement(PasswordResetEmail, params),
    "password-reset"
  );
}

export async function sendVerificationEmail(params: { to: string; firstName: string; verificationLink: string }) {
  await send(
    params.to,
    "Verify your HanHub email",
    React.createElement(VerificationEmail, params),
    "verification"
  );
}
