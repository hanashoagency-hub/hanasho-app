import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout, { emailTheme } from "./components/EmailLayout";

const ACCENT = "#C7F233";

interface PurchaseReceiptEmailProps {
  firstName: string;
  itemTitle: string;
  amount: number;
  currency: string;
  referenceId: string;
}

export default function PurchaseReceiptEmail({ firstName, itemTitle, amount, currency, referenceId }: PurchaseReceiptEmailProps) {
  return (
    <EmailLayout previewText={`Your receipt for ${itemTitle}`}>
      <Heading style={{ color: emailTheme.TEXT, fontSize: 22, margin: "0 0 16px 0" }}>Payment Confirmed ✅</Heading>
      <Text style={{ color: emailTheme.TEXT, opacity: 0.85, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px 0" }}>
        Hi {firstName}, here&apos;s your receipt.
      </Text>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px 0", color: emailTheme.TEXT, opacity: 0.6, fontSize: 13 }}>Item</td>
            <td style={{ padding: "8px 0", color: emailTheme.TEXT, fontSize: 13, textAlign: "right" }}>{itemTitle}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: emailTheme.TEXT, opacity: 0.6, fontSize: 13, borderTop: `1px solid ${emailTheme.BORDER}` }}>Amount</td>
            <td style={{ padding: "8px 0", color: emailTheme.TEXT, fontSize: 13, textAlign: "right", borderTop: `1px solid ${emailTheme.BORDER}`, fontWeight: "bold" }}>
              {currency} {amount.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: emailTheme.TEXT, opacity: 0.6, fontSize: 13, borderTop: `1px solid ${emailTheme.BORDER}` }}>Reference</td>
            <td style={{ padding: "8px 0", color: emailTheme.TEXT, opacity: 0.6, fontSize: 12, textAlign: "right", borderTop: `1px solid ${emailTheme.BORDER}` }}>{referenceId}</td>
          </tr>
        </tbody>
      </table>

      <Button
        href="https://hanhub.so/dashboard"
        style={{
          display: "block", textAlign: "center", backgroundColor: ACCENT, color: emailTheme.BRAND_BG,
          fontWeight: "bold", fontSize: 15, padding: "14px 20px", borderRadius: 14,
        }}
      >
        Go to Dashboard
      </Button>
    </EmailLayout>
  );
}
