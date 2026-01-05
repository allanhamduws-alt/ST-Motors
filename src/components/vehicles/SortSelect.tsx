"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface SortSelectProps {
  defaultValue?: string
}

export function SortSelect({ defaultValue = "newest" }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    router.push(`/fahrzeuge?${params.toString()}`)
  }

  return (
    <select
      className="bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      defaultValue={defaultValue}
      onChange={handleChange}
    >
      <option value="newest">Neueste zuerst</option>
      <option value="price-asc">Preis aufsteigend</option>
      <option value="price-desc">Preis absteigend</option>
      <option value="km-asc">Kilometerstand aufsteigend</option>
    </select>
  )
}

