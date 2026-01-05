import { MetadataRoute } from "next"
import { db } from "@/lib/db"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stmotors.de"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/fahrzeuge`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ueber-uns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/verkaufen`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Dynamic vehicle pages
  let vehiclePages: MetadataRoute.Sitemap = []
  try {
    const vehicles = await db.vehicle.findMany({
      where: { status: "AKTIV" },
      select: { slug: true, updatedAt: true },
    })

    vehiclePages = vehicles.map((vehicle) => ({
      url: `${baseUrl}/fahrzeuge/${vehicle.slug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error("Error fetching vehicles for sitemap:", error)
  }

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "VEROEFFENTLICHT" },
      select: { slug: true, updatedAt: true },
    })

    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error)
  }

  return [...staticPages, ...vehiclePages, ...blogPages]
}

