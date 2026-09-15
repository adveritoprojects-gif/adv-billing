import "./globals.css";
import Shell from "@/components/Shell";

export const metadata = {
  title: "Adv Billings",
  description: "Clinic billing software: patients, x-ray records, and invoicing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <Shell>{children}</Shell>
      </body>
    </html>
  );
}
