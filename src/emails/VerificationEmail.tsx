import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout, { emailTheme } from "./components/EmailLayout";

const ACCENT = "#C7F233";

interface VerificationEmailProps {
  firstName: string;
  verificationLink: string;
}

export default function VerificationEmail({ firstName, verificationLink }: VerificationEmailProps) {
  return (
    <EmailLayout previewText="Verify your HanHub email address">
      <Heading style={{ color: emailTheme.TEXT, fontSize: 22, margin: "0 0 16px 0" }}>Verify your email</Heading>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px 0" }}>
        Hi {firstName}, confirm your email address to finish setting up your HanHub account.
      </Text>
      <Button
        href={verificationLink}
        style={{
          display: "block", textAlign: "center", backgroundColor: ACCENT, color: emailTheme.BRAND_BG,
          fontWeight: "bold", fontSize: 15, padding: "14px 20px", borderRadius: 14,
        }}
      >
        Verify Email
      </Button>
    </EmailLayout>
  );
}
