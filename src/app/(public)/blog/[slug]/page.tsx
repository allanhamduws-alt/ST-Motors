import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await db.blogPost.findUnique({
    where: { slug },
  })

  if (!post || post.status !== "VEROEFFENTLICHT") {
    return {
      title: "Beitrag nicht gefunden | ST Motors GmbH",
    }
  }

  return {
    title: `${post.title} | ST Motors GmbH`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

async function getBlogPost(slug: string) {
  const post = await db.blogPost.findUnique({
    where: { slug },
  })

  if (!post || post.status !== "VEROEFFENTLICHT") {
    return null
  }

  return post
}

async function getAdjacentPosts(currentDate: Date) {
  const [previous, next] = await Promise.all([
    db.blogPost.findFirst({
      where: {
        status: "VEROEFFENTLICHT",
        publishedAt: { lt: currentDate },
      },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    db.blogPost.findFirst({
      where: {
        status: "VEROEFFENTLICHT",
        publishedAt: { gt: currentDate },
      },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ])

  return { previous, next }
}

// Simple Markdown-like formatting
function formatContent(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-zinc-900 underline hover:no-underline">$1</a>')
    // Lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Line breaks
    .replace(/\n/g, '<br />')
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const { previous, next } = await getAdjacentPosts(post.publishedAt || post.createdAt)

  return (
    <div className="min-h-screen">
      {/* Hero mit Bild */}
      {post.featuredImage && (
        <div className="relative h-[50vh] min-h-[400px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Artikel */}
      <article className={`${post.featuredImage ? '-mt-32 relative z-10' : 'pt-8'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Zurück-Link */}
            <Link
              href="/blog"
              className={`inline-flex items-center text-sm mb-6 hover:opacity-80 transition-opacity ${
                post.featuredImage ? 'text-white' : 'text-zinc-600'
              }`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Blog
            </Link>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              {/* Meta */}
              <div className="flex items-center gap-4 mb-6">
                <Badge variant="outline">Blog</Badge>
                <span className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Titel */}
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-zinc-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Trennlinie */}
              <hr className="border-zinc-200 mb-8" />

              {/* Inhalt */}
              <div 
                className="prose prose-zinc max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-a:text-zinc-900"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-4">${formatContent(post.content)}</p>` 
                }}
              />

              {/* Share */}
              <div className="mt-12 pt-8 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Diesen Artikel teilen</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.share) {
                          navigator.share({
                            title: post.title,
                            url: window.location.href,
                          })
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Teilen
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {previous ? (
                <Link
                  href={`/blog/${previous.slug}`}
                  className="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-zinc-400" />
                  <div className="min-w-0">
                    <span className="text-xs text-zinc-500 block">Vorheriger</span>
                    <span className="text-sm font-medium text-zinc-900 truncate block">
                      {previous.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="flex items-center justify-end gap-3 p-4 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors text-right"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-zinc-500 block">Nächster</span>
                    <span className="text-sm font-medium text-zinc-900 truncate block">
                      {next.title}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="bg-zinc-900 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Interesse an einem Fahrzeug?
            </h2>
            <p className="text-zinc-300 mb-6">
              Entdecken Sie unsere aktuellen Premium-Fahrzeuge oder kontaktieren Sie uns 
              für eine persönliche Beratung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/fahrzeuge"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Fahrzeuge ansehen
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

