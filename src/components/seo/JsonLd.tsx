"use client"

interface LocalBusinessProps {
  name: string
  description: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  phone: string
  email: string
  url: string
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
  image?: string
}

export function LocalBusinessJsonLd({
  name,
  description,
  address,
  phone,
  email,
  url,
  openingHours,
  geo,
  image,
}: LocalBusinessProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name,
    description,
    url,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    ...(geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(openingHours && { openingHours }),
    ...(image && { image }),
    priceRange: "€€€",
    paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
    currenciesAccepted: "EUR",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: geo?.latitude || 53.1435,
        longitude: geo?.longitude || 8.9096,
      },
      geoRadius: "50000",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface VehicleJsonLdProps {
  name: string
  description: string
  image: string[]
  url: string
  price: number
  currency?: string
  manufacturer: string
  model: string
  variant?: string
  mileage?: number
  year?: number
  fuelType?: string
  transmission?: string
  color?: string
  vin?: string
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition"
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  seller: {
    name: string
    url: string
  }
}

export function VehicleJsonLd({
  name,
  description,
  image,
  url,
  price,
  currency = "EUR",
  manufacturer,
  model,
  variant,
  mileage,
  year,
  fuelType,
  transmission,
  color,
  vin,
  condition = "UsedCondition",
  availability = "InStock",
  seller,
}: VehicleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name,
    description,
    image,
    url,
    brand: {
      "@type": "Brand",
      name: manufacturer,
    },
    model,
    ...(variant && { vehicleModelDate: variant }),
    ...(mileage && {
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: mileage,
        unitCode: "KMT",
      },
    }),
    ...(year && { vehicleModelDate: year.toString() }),
    ...(fuelType && { fuelType }),
    ...(transmission && { vehicleTransmission: transmission }),
    ...(color && { color }),
    ...(vin && { vehicleIdentificationNumber: vin }),
    itemCondition: `https://schema.org/${condition}`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "AutoDealer",
        name: seller.name,
        url: seller.url,
      },
      priceValidUntil: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString().split("T")[0],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface FAQItem {
  question: string
  answer: string
}

interface FAQJsonLdProps {
  items: FAQItem[]
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ArticleJsonLdProps {
  title: string
  description: string
  url: string
  image?: string
  datePublished: string
  dateModified: string
  author: string
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    ...(image && { image }),
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "ST Motors GmbH",
      url: "https://stmotors.de",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface WebsiteJsonLdProps {
  name: string
  url: string
  description: string
}

export function WebsiteJsonLd({ name, url, description }: WebsiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/fahrzeuge?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

