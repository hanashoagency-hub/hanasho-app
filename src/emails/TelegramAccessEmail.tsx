import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout, { emailTheme } from "./components/EmailLayout";

const ACCENT = "#C7F233";

interface TelegramAccessEmailProps {
  firstName: string;
  courseTitle: string;
  channelInviteLink: string;
  groupInviteLink: string;
}

export default function TelegramAccessEmail({ firstName, courseTitle, channelInviteLink, groupInviteLink }: TelegramAccessEmailProps) {
  return (
    <EmailLayout previewText={`Your private Telegram access for ${courseTitle} is ready`}>
      <Heading style={{ color: emailTheme.TEXT, fontSize: 22, margin: "0 0 16px 0" }}>Welcome to HanHub Academy 🎉</Heading>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 12px 0" }}>
        Hello {firstName},
      </Text>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px 0" }}>
        Thank you for purchasing <strong style={{ color: emailTheme.TEXT }}>{courseTitle}</strong>. Your private Telegram access is ready.
      </Text>

      <Button
        href={channelInviteLink}
        style={{
          display: "block", textAlign: "center", backgroundColor: ACCENT, color: emailTheme.BRAND_BG,
          fontWeight: "bold", fontSize: 15, padding: "14px 20px", borderRadius: 14, marginBottom: 12,
        }}
      >
        📚 Join Course Channel
      </Button>

      <Button
        href={groupInviteLink}
        style={{
          display: "block", textAlign: "center", backgroundColor: "rgba(255,255,255,0.08)", color: emailTheme.TEXT,
          fontWeight: "bold", fontSize: 15, padding: "14px 20px", borderRadius: 14,
          border: `1px solid ${emailTheme.BORDER}`,
        }}
      >
        💬 Join Community Group
      </Button>

      <Text style={{ color: emailTheme.TEXT, opacity: 0.55, fontSize: 12, lineHeight: 1.6, marginTop: 24 }}>
        These invite links are personal — please don&apos;t share them with anyone. If a link expires, just log into your HanHub account and open your purchased course page — a new one is generated automatically.
      </Text>
    </EmailLayout>
  );
}
