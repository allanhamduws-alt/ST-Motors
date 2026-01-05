"use client"

import { useState } from "react"
import Link from "next/link"
import { trpc } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const statusLabels = {
  ENTWURF: "Entwurf",
  VEROEFFENTLICHT: "Veröffentlicht",
}

const statusColors = {
  ENTWURF: "bg-zinc-100 text-zinc-800",
  VEROEFFENTLICHT: "bg-green-100 text-green-800",
}

export default function BlogPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.blog.list.useQuery({
    search: search || undefined,
    status: status !== "all" ? (status as "ENTWURF" | "VEROEFFENTLICHT") : undefined,
    limit: 50,
  })

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog-Beitrag gelöscht")
      utils.blog.list.invalidate()
      setDeleteId(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const posts = data?.posts || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Blog-Beiträge
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Beitrag
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="ENTWURF">Entwurf</SelectItem>
                <SelectItem value="VEROEFFENTLICHT">Veröffentlicht</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabelle */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Keine Blog-Beiträge gefunden</p>
              <Button asChild className="mt-4">
                <Link href="/admin/blog/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Beitrag erstellen
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead>Veröffentlicht</TableHead>
                  <TableHead className="w-[120px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {post.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="h-10 w-14 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{post.title}</p>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[post.status]}>
                        {statusLabels[post.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("de-DE")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {post.status === "VEROEFFENTLICHT" && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/blog/${post.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lösch-Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blog-Beitrag löschen?</DialogTitle>
            <DialogDescription>
              Dieser Vorgang kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
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

