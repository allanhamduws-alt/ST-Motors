"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, Building2, User } from "lucide-react"

const customerFormSchema = z.object({
  type: z.enum(["PRIVAT", "GEWERBE"]),
  role: z.enum(["INTERESSENT", "KAEUFER", "VERKAEUFER"]),
  company: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  street: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string(),
  phone: z.string().optional(),
  email: z.string().email("Gültige E-Mail erforderlich").optional().or(z.literal("")),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  defaultValues?: CustomerFormData
  onSubmit: (data: CustomerFormData) => void
  isLoading?: boolean
  isEdit?: boolean
}

export function CustomerForm({ defaultValues, onSubmit, isLoading, isEdit }: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues || {
      type: "PRIVAT",
      role: "INTERESSENT",
      company: "",
      salutation: "",
      firstName: "",
      lastName: "",
      street: "",
      zipCode: "",
      city: "",
      country: "Deutschland",
      phone: "",
      email: "",
      notes: "",
    },
  })

  const watchType = form.watch("type")

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Kundentyp & Rolle */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Kundendaten</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Kundentyp</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as "PRIVAT" | "GEWERBE")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVAT">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Privatkunde
                  </div>
                </SelectItem>
                <SelectItem value="GEWERBE">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Geschäftskunde
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rolle</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value as "INTERESSENT" | "KAEUFER" | "VERKAEUFER")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERESSENT">Interessent</SelectItem>
                <SelectItem value="KAEUFER">Käufer</SelectItem>
                <SelectItem value="VERKAEUFER">Verkäufer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Firmenname (nur bei Gewerbe) */}
      {watchType === "GEWERBE" && (
        <div className="space-y-2">
          <Label htmlFor="company">Firmenname *</Label>
          <Input
            id="company"
            {...form.register("company")}
            placeholder="GmbH, AG, etc."
          />
          {form.formState.errors.company && (
            <p className="text-sm text-red-500">{form.formState.errors.company.message}</p>
          )}
        </div>
      )}

      {/* Persönliche Daten */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {watchType === "GEWERBE" ? "Ansprechpartner" : "Persönliche Daten"}
        </h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="salutation">Anrede</Label>
            <Select
              value={form.watch("salutation") || ""}
              onValueChange={(value) => form.setValue("salutation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Herr">Herr</SelectItem>
                <SelectItem value="Frau">Frau</SelectItem>
                <SelectItem value="Divers">Divers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Vorname</Label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              placeholder="Max"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lastName">Nachname *</Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              placeholder="Mustermann"
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Adresse</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Straße & Hausnummer</Label>
            <Input
              id="street"
              {...form.register("street")}
              placeholder="Musterstraße 123"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="zipCode">PLZ</Label>
              <Input
                id="zipCode"
                {...form.register("zipCode")}
                placeholder="12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                {...form.register("city")}
                placeholder="Berlin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                {...form.register("country")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Kontakt</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              placeholder="+49 123 456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="max@mustermann.de"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notizen */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notizen</Label>
        <textarea
          id="notes"
          {...form.register("notes")}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Interne Notizen zum Kunden..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Änderungen speichern" : "Kunde anlegen"}
        </Button>
      </div>
    </form>
  )
}

