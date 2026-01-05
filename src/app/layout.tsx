import type { Metadata, Viewport } from "next"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { TRPCProvider } from "@/components/providers/TRPCProvider"
import { LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd"
import "./globals.css"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stmotors.de"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ST Motors GmbH | Premium SUVs und Limousinen in Lilienthal",
    template: "%s | ST Motors GmbH",
  },
  description:
    "ST Motors GmbH in Lilienthal bei Bremen - Ihr Spezialist für Premium SUVs und Limousinen. Range Rover, Mercedes-Benz, BMW, Audi, Porsche. Geprüfte Qualität, faire Preise.",
  keywords: [
    "Autohaus Lilienthal",
    "Premium Fahrzeuge Bremen",
    "SUV kaufen",
    "Limousine kaufen",
    "Range Rover Händler",
    "Mercedes-Benz Gebrauchtwagen",
    "BMW Gebrauchtwagen",
    "Audi Gebrauchtwagen",
    "Porsche Gebrauchtwagen",
    "Lilienthal",
    "Bremen",
    "Gebrauchtwagen",
    "Luxusautos",
    "Premium Gebrauchtwagen",
    "ST Motors",
  ],
  authors: [{ name: "ST Motors GmbH", url: baseUrl }],
  creator: "ST Motors GmbH",
  publisher: "ST Motors GmbH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "ST Motors GmbH | Premium SUVs und Limousinen",
    description:
      "Ihr Partner für Premium SUVs und Limousinen in Lilienthal bei Bremen. Range Rover, Mercedes, BMW, Audi und mehr. Geprüfte Qualität.",
    type: "website",
    locale: "de_DE",
    url: baseUrl,
    siteName: "ST Motors GmbH",
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ST Motors GmbH - Premium Fahrzeuge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ST Motors GmbH | Premium SUVs und Limousinen",
    description: "Ihr Partner für Premium SUVs und Limousinen in Lilienthal bei Bremen.",
    images: [`${baseUrl}/images/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have the verification codes
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "Automotive",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <head>
        <WebsiteJsonLd
          name="ST Motors GmbH"
          url={baseUrl}
          description="Premium SUVs und Limousinen in Lilienthal bei Bremen"
        />
        <LocalBusinessJsonLd
          name="ST Motors GmbH"
          description="Ihr Spezialist für Premium SUVs und Limousinen. Range Rover, Mercedes-Benz, BMW, Audi, Porsche. Geprüfte Qualität, faire Preise."
          address={{
            street: "Am Wolfsberg 4",
            city: "Lilienthal",
            postalCode: "28865",
            country: "DE",
          }}
          phone="+49 4298 9099069"
          email="info@stmotors.de"
          url={baseUrl}
          openingHours={[
            "Mo-Fr 09:00-18:00",
            "Sa 10:00-14:00",
          ]}
          geo={{
            latitude: 53.1435,
            longitude: 8.9096,
          }}
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
