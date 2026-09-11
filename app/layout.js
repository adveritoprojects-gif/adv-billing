import "./globals.css";
import { ModeProvider } from "@/components/ModeContext";
import Shell from "@/components/Shell";

export const metadata = {
  title: "Riverside Clinic — Billing",
  description: "Clinic billing software: patients, x-ray records, and invoicing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ModeProvider>
          <Shell>{children}</Shell>
        </ModeProvider>
      </body>
    </html>
  );
}
