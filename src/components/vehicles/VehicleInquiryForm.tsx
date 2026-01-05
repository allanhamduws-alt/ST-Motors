"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trpc } from "@/lib/trpc"

const inquirySchema = z.object({
  name: z.string().min(2, "Bitte geben Sie Ihren Namen ein"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  phone: z.string().optional(),
  message: z.string().min(10, "Bitte geben Sie eine Nachricht ein (min. 10 Zeichen)"),
})

type InquiryFormData = z.infer<typeof inquirySchema>

interface VehicleInquiryFormProps {
  vehicleId: string
  vehicleTitle: string
}

export function VehicleInquiryForm({
  vehicleId,
  vehicleTitle,
}: VehicleInquiryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      message: `Guten Tag,\n\nich interessiere mich für das Fahrzeug "${vehicleTitle}" und hätte gerne weitere Informationen.\n\nMit freundlichen Grüßen`,
    },
  })

  const onSubmit = async (data: InquiryFormData) => {
    try {
      setSubmitError(null)
      // In a real app, this would send to the backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      console.log("Inquiry submitted:", {
        ...data,
        vehicleId,
        vehicleTitle,
        type: "FAHRZEUGANFRAGE",
      })

      setIsSubmitted(true)
      reset()
    } catch {
      setSubmitError(
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
      )
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Anfrage gesendet!</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich bei
          Ihnen.
        </p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
          Weitere Anfrage senden
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ihr Name"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          E-Mail <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ihre@email.de"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon (optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+49 123 456789"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Nachricht <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="message"
          rows={5}
          placeholder="Ihre Nachricht..."
          {...register("message")}
          className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
            errors.message ? "border-destructive" : ""
          }`}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {submitError}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Mit dem Absenden stimmen Sie unserer{" "}
        <a href="/datenschutz" className="underline hover:text-primary">
          Datenschutzerklärung
        </a>{" "}
        zu.
      </p>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird gesendet...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Anfrage senden
          </>
        )}
      </Button>
    </form>
  )
}

