import { Metadata } from "next"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie ST Motors GmbH in Lilienthal. Telefon: +49 4298 9099069. Besuchen Sie uns am Wolfsberg 4.",
}

export default function KontaktPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Kontakt
            </h1>
            <p className="text-lg text-white/80">
              Haben Sie Fragen zu einem Fahrzeug oder möchten Sie einen Termin
              vereinbaren? Wir sind gerne für Sie da.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Nachricht senden</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input id="firstName" placeholder="Max" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input id="lastName" placeholder="Mustermann" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="max@beispiel.de"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" placeholder="+49 123 456789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Betreff *</Label>
                  <select
                    id="subject"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    <option value="fahrzeug">Fahrzeuganfrage</option>
                    <option value="verkauf">Fahrzeug verkaufen</option>
                    <option value="finanzierung">Finanzierung</option>
                    <option value="termin">Terminvereinbarung</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht *</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Ihre Nachricht an uns..."
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    required
                    className="mt-1"
                  />
                  <Label htmlFor="privacy" className="text-sm font-normal">
                    Ich habe die{" "}
                    <a href="/datenschutz" className="underline hover:text-primary">
                      Datenschutzerklärung
                    </a>{" "}
                    gelesen und bin mit der Verarbeitung meiner Daten
                    einverstanden.
                  </Label>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="mr-2 h-5 w-5" />
                  Nachricht absenden
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Contact Details */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="font-display text-2xl font-bold mb-6">
                  So erreichen Sie uns
                </h2>
                <div className="space-y-6">
                  <a
                    href="tel:+4942989099069"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Telefon</div>
                      <div className="text-muted-foreground group-hover:text-primary transition-colors">
                        +49 4298 9099069
                      </div>
                    </div>
                  </a>

                  <a
                    href="mailto:info@stmotors.de"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">E-Mail</div>
                      <div className="text-muted-foreground group-hover:text-primary transition-colors">
                        info@stmotors.de
                      </div>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Adresse</div>
                      <div className="text-muted-foreground">
                        Am Wolfsberg 4<br />
                        28865 Lilienthal
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Öffnungszeiten</div>
                      <div className="text-muted-foreground space-y-1">
                        <div className="flex justify-between gap-8">
                          <span>Mo - Fr</span>
                          <span>09:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span>Sa</span>
                          <span>10:00 - 14:00</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span>So</span>
                          <span>Geschlossen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground">Google Maps</p>
                  <a
                    href="https://maps.google.com/?q=Am+Wolfsberg+4,+28865+Lilienthal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    In Google Maps öffnen
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

