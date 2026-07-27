import { Body, Container, Head, Hr, Html, Img, Preview, Text } from "@react-email/components";
import * as React from "react";

const BRAND_BG = "#04170E";
const CARD_BG = "#0E2A1B";
const TEXT = "#F2EFE7";
const BORDER = "rgba(255,255,255,0.08)";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export default function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: BRAND_BG, fontFamily: "Helvetica,Arial,sans-serif", margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            maxWidth: 480,
            backgroundColor: CARD_BG,
            borderRadius: 20,
            overflow: "hidden",
            border: `1px solid ${BORDER}`,
            padding: "32px",
          }}
        >
          <Img
            src="https://hanhub.so/assets/logo.png"
            alt="HanHub"
            width="56"
            height="56"
            style={{ borderRadius: 12, marginBottom: 16 }}
          />
          {children}
          <Hr style={{ borderColor: BORDER, marginTop: 24, marginBottom: 16 }} />
          <Text style={{ color: TEXT, opacity: 0.4, fontSize: 11, margin: 0 }}>HanHub Academy</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const emailTheme = { BRAND_BG, CARD_BG, TEXT, BORDER };
