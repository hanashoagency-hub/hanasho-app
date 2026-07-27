import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout, { emailTheme } from "./components/EmailLayout";

const ACCENT = "#C7F233";

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Welcome to HanHub Academy">
      <Heading style={{ color: emailTheme.TEXT, fontSize: 22, margin: "0 0 16px 0" }}>Welcome to HanHub, {firstName} 👋</Heading>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px 0" }}>
        Your account is ready. Explore courses on AI, digital marketing, Web3, and more — built for the Somali digital community.
      </Text>
      <Button
        href="https://hanhub.so/courses"
        style={{
          display: "block", textAlign: "center", backgroundColor: ACCENT, color: emailTheme.BRAND_BG,
          fontWeight: "bold", fontSize: 15, padding: "14px 20px", borderRadius: 14,
        }}
      >
        Browse Courses
      </Button>
    </EmailLayout>
  );
}
