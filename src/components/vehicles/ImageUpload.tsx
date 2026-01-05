"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { generateReactHelpers } from "@uploadthing/react"
import { toast } from "sonner"
import { Upload, X, GripVertical, Loader2, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

interface ImageUploadProps {
  images: Array<{ url: string; order: number }>
  onChange: (images: Array<{ url: string; order: number }>) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 20 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { startUpload } = useUploadThing("vehicleImage", {
    onClientUploadComplete: (res) => {
      if (res) {
        const newImages = res.map((file, index) => ({
          url: file.url,
          order: images.length + index,
        }))
        onChange([...images, ...newImages])
        toast.success(`${res.length} Bild(er) hochgeladen`)
      }
      setIsUploading(false)
      setUploadProgress(0)
    },
    onUploadError: (error) => {
      toast.error(error.message || "Fehler beim Hochladen")
      setIsUploading(false)
      setUploadProgress(0)
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
  })

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximal ${maxImages} Bilder erlaubt`)
        return
      }

      setIsUploading(true)
      await startUpload(acceptedFiles)
    },
    [images.length, maxImages, startUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 4 * 1024 * 1024, // 4MB
    disabled: isUploading,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // Re-order remaining images
    onChange(newImages.map((img, i) => ({ ...img, order: i })))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages.map((img, i) => ({ ...img, order: i })))
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-zinc-300"}
          ${isUploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Hochladen... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-10 w-10 text-zinc-400" />
            <p className="text-sm font-medium">
              {isDragActive ? "Bilder hier ablegen" : "Bilder hierher ziehen"}
            </p>
            <p className="text-xs text-zinc-500">
              oder klicken zum Auswählen (max. 4MB pro Bild, JPG/PNG/WebP)
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={img.url}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-zinc-100"
            >
              <img
                src={img.url}
                alt={`Bild ${index + 1}`}
                className="h-full w-full object-cover"
              />
              
              {/* Overlay mit Aktionen */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Titelbild Badge */}
              {index === 0 && (
                <Badge className="absolute left-2 top-2 bg-primary">
                  Titelbild
                </Badge>
              )}

              {/* Order Number */}
              <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-center text-xs text-zinc-500">
        {images.length} / {maxImages} Bilder • Das erste Bild wird als Titelbild verwendet
      </p>
    </div>
  )
}

