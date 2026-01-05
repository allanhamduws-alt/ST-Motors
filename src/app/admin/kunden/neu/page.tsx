"use client"

import { useRouter } from "next/navigation"
import { CustomerForm } from "@/components/customers/CustomerForm"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NeuerKundePage() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const createMutation = trpc.customer.create.useMutation({
    onSuccess: (customer) => {
      toast.success("Kunde erfolgreich angelegt")
      utils.customer.list.invalidate()
      utils.customer.getStats.invalidate()
      router.push(`/admin/kunden/${customer.id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/kunden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Neuer Kunde</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Legen Sie einen neuen Kunden an
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border bg-white p-6">
        <CustomerForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}

