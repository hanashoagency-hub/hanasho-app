import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout, { emailTheme } from "./components/EmailLayout";

const ACCENT = "#C7F233";

interface PasswordResetEmailProps {
  firstName: string;
  resetLink: string;
}

export default function PasswordResetEmail({ firstName, resetLink }: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Reset your HanHub password">
      <Heading style={{ color: emailTheme.TEXT, fontSize: 22, margin: "0 0 16px 0" }}>Reset your password</Heading>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px 0" }}>
        Hi {firstName}, we received a request to reset your HanHub password. If this wasn&apos;t you, you can safely ignore this email.
      </Text>
      <Button
        href={resetLink}
        style={{
          display: "block", textAlign: "center", backgroundColor: ACCENT, color: emailTheme.BRAND_BG,
          fontWeight: "bold", fontSize: 15, padding: "14px 20px", borderRadius: 14,
        }}
      >
        Reset Password
      </Button>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.5, fontSize: 12, lineHeight: 1.6, marginTop: 20 }}>
        This link expires shortly for your security.
      </Text>
    </EmailLayout>
  );
}
