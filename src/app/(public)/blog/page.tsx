import { db } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, FileText } from "lucide-react"

export const metadata = {
  title: "Blog | ST Motors GmbH",
  description: "Neuigkeiten, Tipps und Wissenswertes rund um Premium-Fahrzeuge von ST Motors GmbH",
}

// Force dynamic rendering - don't try to build statically
export const dynamic = 'force-dynamic'

async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "VEROEFFENTLICHT" },
      orderBy: { publishedAt: "desc" },
      take: 20,
    })
    return posts
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-zinc-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-white/20 text-white/80">
              Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Aktuelles von ST Motors
            </h1>
            <p className="text-lg text-zinc-300">
              Neuigkeiten, Tipps und Wissenswertes rund um Premium-Fahrzeuge
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
              <h2 className="text-2xl font-semibold text-zinc-700 mb-2">
                Noch keine Beiträge
              </h2>
              <p className="text-zinc-500">
                Schauen Sie bald wieder vorbei für interessante Artikel.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-500 group card-hover-border hover:-translate-y-2">
                    {/* Bild */}
                    <div className="aspect-video overflow-hidden bg-zinc-100">
                      {post.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                          <FileText className="h-12 w-12 text-zinc-300" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      {/* Datum */}
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
                        <Calendar className="h-4 w-4" />
                        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>

                      {/* Titel */}
                      <h2 className="text-xl font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-zinc-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Weiterlesen */}
                      <span className="inline-flex items-center text-sm font-medium text-zinc-900 group-hover:text-zinc-700">
                        Weiterlesen
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-zinc-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">
              Bleiben Sie informiert
            </h2>
            <p className="text-zinc-600 mb-6">
              Haben Sie Fragen zu einem Fahrzeug oder möchten Sie mehr erfahren?
              Kontaktieren Sie uns jederzeit.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Kontakt aufnehmen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

