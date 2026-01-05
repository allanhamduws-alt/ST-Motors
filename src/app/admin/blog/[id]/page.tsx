"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Eye, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/vehicles/ImageUpload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BlogBeitragBearbeitenPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const utils = trpc.useUtils()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    status: "ENTWURF" as "ENTWURF" | "VEROEFFENTLICHT",
  })

  const { data: post, isLoading } = trpc.blog.getById.useQuery({ id })

  // Formulardaten füllen wenn Post geladen
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content,
        featuredImage: post.featuredImage || "",
        status: post.status,
      })
    }
  }, [post])

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog-Beitrag aktualisiert")
      utils.blog.getById.invalidate({ id })
      utils.blog.list.invalidate()
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSubmitting(false)
    },
  })

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog-Beitrag gelöscht")
      router.push("/admin/blog")
    },
    onError: (error) => {
      toast.error(error.message)
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
    updateMutation.mutate({
      id,
      data: formData,
    })
  }

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, featuredImage: urls[0] }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Blog-Beitrag nicht gefunden</p>
        <Button asChild>
          <Link href="/admin/blog">Zurück zur Übersicht</Link>
        </Button>
      </div>
    )
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
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Beitrag bearbeiten</h1>
            <Badge
              className={
                post.status === "VEROEFFENTLICHT"
                  ? "bg-green-100 text-green-800"
                  : "bg-zinc-100 text-zinc-800"
              }
            >
              {post.status === "VEROEFFENTLICHT" ? "Veröffentlicht" : "Entwurf"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Erstellt am {new Date(post.createdAt).toLocaleDateString("de-DE")}
          </p>
        </div>
        <div className="flex gap-2">
          {post.status === "VEROEFFENTLICHT" && (
            <Button variant="outline" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ansehen
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
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
                      <SelectItem value="VEROEFFENTLICHT">Veröffentlicht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {post.publishedAt && (
                  <div className="text-sm text-muted-foreground">
                    Veröffentlicht am{" "}
                    {new Date(post.publishedAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Speichern
                </Button>
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
                  <ImageUpload onUpload={handleImageUpload} maxFiles={1} />
                )}
              </CardContent>
            </Card>

            {/* Slug */}
            <Card>
              <CardHeader>
                <CardTitle>URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-muted px-2 py-1 rounded block truncate">
                  /blog/{post.slug}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Lösch-Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blog-Beitrag löschen?</DialogTitle>
            <DialogDescription>
              Möchten Sie &quot;{post.title}&quot; wirklich löschen? Dieser Vorgang kann
              nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

