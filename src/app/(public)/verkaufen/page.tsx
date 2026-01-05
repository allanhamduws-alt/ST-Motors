import { Metadata } from "next"
import {
  CheckCircle,
  Upload,
  Phone,
  Mail,
  ArrowRight,
  Car,
  Banknote,
  Clock,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Fahrzeug verkaufen",
  description:
    "Verkaufen Sie Ihr Fahrzeug an ST Motors. Schnelle und faire Bewertung, unkomplizierte Abwicklung.",
}

const benefits = [
  {
    icon: Banknote,
    title: "Faire Preise",
    description: "Wir bieten marktgerechte Preise für Ihr Fahrzeug.",
  },
  {
    icon: Clock,
    title: "Schnelle Abwicklung",
    description: "Bewertung innerhalb von 24 Stunden, Auszahlung sofort.",
  },
  {
    icon: Shield,
    title: "Sichere Zahlung",
    description: "Sofortige Banküberweisung oder Barzahlung vor Ort.",
  },
]

const steps = [
  {
    number: "01",
    title: "Anfrage senden",
    description: "Füllen Sie das Formular aus und senden Sie uns die Daten Ihres Fahrzeugs.",
  },
  {
    number: "02",
    title: "Bewertung erhalten",
    description: "Wir bewerten Ihr Fahrzeug und machen Ihnen ein faires Angebot.",
  },
  {
    number: "03",
    title: "Termin vereinbaren",
    description: "Bei Interesse vereinbaren wir einen Besichtigungstermin.",
  },
  {
    number: "04",
    title: "Schnelle Auszahlung",
    description: "Nach erfolgreicher Prüfung erhalten Sie sofort Ihr Geld.",
  },
]

export default function VerkaufenPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Fahrzeug verkaufen
              </h1>
              <p className="text-lg text-white/80 mb-6">
                Sie möchten Ihr Fahrzeug verkaufen? Wir kaufen hochwertige
                Gebrauchtwagen zu fairen Preisen. Schnelle Bewertung,
                unkomplizierte Abwicklung.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="secondary" size="lg">
                  <a href="#formular">
                    Jetzt Bewertung anfordern
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <a href="tel:+4942989099069">
                    <Phone className="mr-2 h-5 w-5" />
                    Anrufen
                  </a>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                <Car className="h-32 w-32 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              So funktioniert&apos;s
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              In nur 4 einfachen Schritten zum erfolgreichen Fahrzeugverkauf.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-display font-bold text-primary/10 mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-4 text-primary/20">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="formular" className="py-16 bg-white scroll-mt-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">
                Kostenlose Bewertung anfordern
              </h2>
              <p className="text-muted-foreground text-lg">
                Füllen Sie das Formular aus und wir melden uns schnellstmöglich
                bei Ihnen.
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <form className="space-y-6">
                  {/* Vehicle Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Fahrzeugdaten
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manufacturer">Hersteller *</Label>
                        <Input id="manufacturer" placeholder="z.B. BMW" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Modell *</Label>
                        <Input id="model" placeholder="z.B. X5" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Erstzulassung *</Label>
                        <Input id="year" placeholder="z.B. 03/2021" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Kilometerstand *</Label>
                        <Input
                          id="mileage"
                          type="number"
                          placeholder="z.B. 45000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuel">Kraftstoff</Label>
                        <select
                          id="fuel"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Bitte wählen</option>
                          <option value="benzin">Benzin</option>
                          <option value="diesel">Diesel</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="elektro">Elektro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Preisvorstellung (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="z.B. 45000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Kontaktdaten
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" placeholder="Ihr Name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ihre@email.de"
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="phone">Telefon *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+49 123 456789"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="message">Zusätzliche Informationen</Label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Weitere Details zu Ihrem Fahrzeug (Ausstattung, Zustand, etc.)"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      />
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="privacy" required className="mt-1" />
                    <Label htmlFor="privacy" className="text-sm font-normal">
                      Ich habe die{" "}
                      <a
                        href="/datenschutz"
                        className="underline hover:text-primary"
                      >
                        Datenschutzerklärung
                      </a>{" "}
                      gelesen und bin mit der Verarbeitung meiner Daten
                      einverstanden.
                    </Label>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Kostenlose Bewertung anfordern
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* We buy these brands */}
      <section className="py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Wir kaufen diese Marken
            </h2>
            <p className="text-muted-foreground text-lg">
              Wir sind spezialisiert auf Premium-Fahrzeuge folgender Hersteller:
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Range Rover",
              "Mercedes-Benz",
              "BMW",
              "Audi",
              "Porsche",
              "Volkswagen",
              "Volvo",
              "Land Rover",
            ].map((brand) => (
              <div
                key={brand}
                className="px-6 py-3 bg-white rounded-full shadow-sm font-medium"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Fragen? Rufen Sie uns an!
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Unser Team steht Ihnen gerne zur Verfügung.
          </p>
          <Button asChild variant="secondary" size="lg">
            <a href="tel:+4942989099069">
              <Phone className="mr-2 h-5 w-5" />
              +49 4298 9099069
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}

