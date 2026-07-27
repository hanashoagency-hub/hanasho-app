import { Heading, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout, { emailTheme } from "./components/EmailLayout";

interface BroadcastEmailProps {
  firstName: string;
  subject: string;
  message: string;
}

export default function BroadcastEmail({ firstName, subject, message }: BroadcastEmailProps) {
  return (
    <EmailLayout previewText={subject}>
      <Heading style={{ color: emailTheme.TEXT, fontSize: 22, margin: "0 0 16px 0" }}>{subject}</Heading>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 12px 0" }}>
        Hello {firstName},
      </Text>
      {message.split("\n").map((line, i) => (
        <Text key={i} style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 10px 0" }}>
          {line}
        </Text>
      ))}
    </EmailLayout>
  );
}
