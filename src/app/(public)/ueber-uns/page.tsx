import { Metadata } from "next"
import Link from "next/link"
import {
  Award,
  Users,
  Car,
  Shield,
  CheckCircle,
  ArrowRight,
  MapPin,
  Phone,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Lernen Sie ST Motors GmbH kennen - Ihr Partner für Premium SUVs und Limousinen in Lilienthal bei Bremen.",
}

const values = [
  {
    icon: Shield,
    title: "Qualität",
    description:
      "Jedes Fahrzeug durchläuft eine umfassende Prüfung, bevor es in unser Portfolio aufgenommen wird.",
  },
  {
    icon: Users,
    title: "Kundenservice",
    description:
      "Persönliche Beratung und individuelle Betreuung stehen bei uns an erster Stelle.",
  },
  {
    icon: Award,
    title: "Erfahrung",
    description:
      "Langjährige Erfahrung im Automobilhandel und fundiertes Fachwissen.",
  },
  {
    icon: CheckCircle,
    title: "Transparenz",
    description:
      "Faire Preise ohne versteckte Kosten und vollständige Fahrzeughistorie.",
  },
]

const stats = [
  { value: "500+", label: "Zufriedene Kunden", showStar: false },
  { value: "100%", label: "Geprüfte Fahrzeuge", showStar: false },
  { value: "24h", label: "Schnelle Antwort", showStar: false },
  { value: "5", label: "Google Bewertung", showStar: true },
]

export default function UeberUnsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Über ST Motors
            </h1>
            <p className="text-lg text-white/80">
              Ihr zuverlässiger Partner für Premium-Gebrauchtwagen in Lilienthal
              bei Bremen. Qualität, Service und Kundenzufriedenheit stehen bei
              uns an erster Stelle.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Unsere Geschichte
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ST Motors GmbH wurde mit der Vision gegründet, Premium-Fahrzeuge
                  mit erstklassigem Service zu verbinden. Unser Standort in
                  Lilienthal, nur wenige Minuten von Bremen entfernt, bietet Ihnen
                  eine exklusive Auswahl an hochwertigen SUVs und Limousinen.
                </p>
                <p>
                  Wir haben uns auf Fahrzeuge von renommierten Herstellern wie
                  Range Rover, Mercedes-Benz, BMW, Audi und Porsche spezialisiert.
                  Jedes Fahrzeug in unserem Portfolio wird sorgfältig ausgewählt
                  und geprüft, um höchste Qualitätsstandards zu gewährleisten.
                </p>
                <p>
                  Unser Anspruch ist es, Ihnen nicht nur ein Fahrzeug zu
                  verkaufen, sondern ein rundum zufriedenstellendes Kauferlebnis
                  zu bieten – von der ersten Beratung bis zur Fahrzeugübergabe und
                  darüber hinaus.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-secondary rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <span className="font-display font-bold text-5xl text-primary-foreground">
                      ST
                    </span>
                  </div>
                  <p className="font-display text-xl font-semibold">
                    ST Motors GmbH
                  </p>
                  <p className="text-muted-foreground">Premium Automobile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2 flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.showStar && <Star className="h-10 w-10 fill-primary" />}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Unsere Werte
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Diese Grundsätze leiten uns bei allem, was wir tun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary flex items-center justify-center mb-4">
                    <value.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-20 bg-secondary/30">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="font-display text-2xl font-bold mb-6">
                  Was wir bieten
                </h3>
                <ul className="space-y-4">
                  {[
                    "Handverlesene Premium-Fahrzeuge",
                    "Umfassende Fahrzeugprüfung",
                    "Transparente Fahrzeughistorie",
                    "Faire und marktgerechte Preise",
                    "Finanzierungsmöglichkeiten",
                    "Inzahlungnahme Ihres Fahrzeugs",
                    "Persönliche Beratung",
                    "After-Sales Service",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Ihr Partner für Premium-Fahrzeuge
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Bei ST Motors finden Sie ausschließlich handverlesene Fahrzeuge,
                  die unseren hohen Qualitätsansprüchen genügen. Wir konzentrieren
                  uns auf das Premium-Segment und bieten Ihnen SUVs und Limousinen
                  von den besten Herstellern.
                </p>
                <p>
                  Ob Sie Ihr Traumfahrzeug suchen oder Ihr aktuelles Auto
                  verkaufen möchten – bei uns sind Sie richtig. Unser erfahrenes
                  Team berät Sie kompetent und unterstützt Sie bei allen Fragen
                  rund um den Fahrzeugkauf oder -verkauf.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <Button asChild size="lg">
                  <Link href="/fahrzeuge">
                    Fahrzeuge ansehen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/kontakt">Kontakt aufnehmen</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Unser Standort
            </h2>
            <p className="text-muted-foreground text-lg">
              Besuchen Sie uns in Lilienthal bei Bremen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Adresse</div>
                      <div className="text-muted-foreground">
                        Am Wolfsberg 4<br />
                        28865 Lilienthal
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Telefon</div>
                      <a
                        href="tel:+4942989099069"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +49 4298 9099069
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-full min-h-[200px] bg-secondary flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <a
                    href="https://maps.google.com/?q=Am+Wolfsberg+4,+28865+Lilienthal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    In Google Maps öffnen
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Bereit für Ihr neues Fahrzeug?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Entdecken Sie unsere aktuelle Auswahl oder kontaktieren Sie uns für
            eine persönliche Beratung.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link href="/fahrzeuge">
                Fahrzeuge entdecken
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <a href="tel:+4942989099069">
                <Phone className="mr-2 h-5 w-5" />
                +49 4298 9099069
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

