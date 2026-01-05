"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Eye } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/vehicles/ImageUpload"

export default function NeuerBlogBeitragPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    status: "ENTWURF" as "ENTWURF" | "VEROEFFENTLICHT",
  })

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: (data) => {
      toast.success("Blog-Beitrag erstellt")
      router.push(`/admin/blog/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSubmitting(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein")
      return
    }
    if (!formData.content.trim()) {
      toast.error("Bitte geben Sie einen Inhalt ein")
      return
    }

    setIsSubmitting(true)
    createMutation.mutate(formData)
  }

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, featuredImage: urls[0] }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Neuer Blog-Beitrag</h1>
          <p className="text-sm text-muted-foreground">
            Erstellen Sie einen neuen Blog-Artikel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hauptinhalt */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inhalt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Der Titel Ihres Beitrags"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Kurzfassung</Label>
                  <Input
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    placeholder="Eine kurze Beschreibung für die Vorschau"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Inhalt *</Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Schreiben Sie hier Ihren Blog-Beitrag..."
                    className="w-full min-h-[400px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tipp: Sie können Markdown für die Formatierung verwenden
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Veröffentlichung */}
            <Card>
              <CardHeader>
                <CardTitle>Veröffentlichung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value as "ENTWURF" | "VEROEFFENTLICHT",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTWURF">Entwurf</SelectItem>
                      <SelectItem value="VEROEFFENTLICHT">Veröffentlichen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Speichern
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Beitragsbild */}
            <Card>
              <CardHeader>
                <CardTitle>Beitragsbild</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featuredImage ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.featuredImage}
                      alt="Beitragsbild"
                      className="w-full rounded-lg object-cover aspect-video"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, featuredImage: "" }))
                      }
                    >
                      Bild entfernen
                    </Button>
                  </div>
                ) : (
                  <ImageUpload
                    onUpload={handleImageUpload}
                    maxFiles={1}
                  />
                )}
              </CardContent>
            </Card>

            {/* Vorschau Link */}
            {formData.status === "VEROEFFENTLICHT" && (
              <Card>
                <CardContent className="pt-6">
                  <Button variant="outline" className="w-full" type="button">
                    <Eye className="mr-2 h-4 w-4" />
                    Vorschau
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

