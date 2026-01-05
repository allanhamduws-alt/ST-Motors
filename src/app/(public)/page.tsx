import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Shield, Award, Handshake, Phone, Car, CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VehicleCard } from "@/components/vehicles/VehicleCard"
import { db } from "@/lib/db"

async function getFeaturedVehicles() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: {
        status: "AKTIV",
      },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    })
    return vehicles
  } catch {
    return []
  }
}

async function getVehicleStats() {
  try {
    const [total, available] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: "AKTIV" } }),
    ])
    return { total, available }
  } catch {
    return { total: 0, available: 0 }
  }
}

const brands = [
  { name: "Range Rover", logo: "RR" },
  { name: "Mercedes-Benz", logo: "MB" },
  { name: "BMW", logo: "BMW" },
  { name: "Audi", logo: "AUDI" },
  { name: "Porsche", logo: "P" },
  { name: "Volkswagen", logo: "VW" },
]

const features = [
  {
    icon: Shield,
    title: "Geprüfte Qualität",
    description:
      "Jedes Fahrzeug durchläuft eine umfassende Prüfung vor der Aufnahme in unser Portfolio.",
  },
  {
    icon: Award,
    title: "Premium Auswahl",
    description:
      "Wir spezialisieren uns auf hochwertige SUVs und Limousinen von renommierten Herstellern.",
  },
  {
    icon: Handshake,
    title: "Faire Preise",
    description:
      "Transparente Preisgestaltung ohne versteckte Kosten. Inzahlungnahme möglich.",
  },
]

export default async function HomePage() {
  const [vehicles, stats] = await Promise.all([
    getFeaturedVehicles(),
    getVehicleStats(),
  ])

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-sm font-medium text-primary">
                <Car className="h-4 w-4" />
                <span>Premium Automobile seit 2020</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-primary">Premium SUVs</span>
                <br />
                <span className="text-muted-foreground">& Limousinen</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Ihr Spezialist für hochwertige Gebrauchtfahrzeuge in Lilienthal
                bei Bremen. Entdecken Sie unsere exklusive Auswahl an Range Rover,
                Mercedes, BMW und mehr.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base h-14 px-8 font-semibold">
                  <Link href="/fahrzeuge">
                    Fahrzeuge entdecken
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base h-14 px-8 font-semibold"
                >
                  <Link href="/verkaufen">Fahrzeug verkaufen</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-12 pt-6">
                <div>
                  <div className="text-4xl font-display font-bold text-primary">
                    {stats.available}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fahrzeuge verfügbar
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-primary">
                    100%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Geprüfte Qualität
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-primary flex items-center gap-1">
                    5<Star className="h-8 w-8 fill-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Kundenzufriedenheit
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image Placeholder */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground">Premium Fahrzeug</p>
                  </div>
                </div>
                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Geprüft</div>
                      <div className="text-xs text-muted-foreground">
                        TÜV & Service
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white border-y">
        <div className="container-custom">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Unsere Premium-Marken
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={`/fahrzeuge?hersteller=${brand.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-3 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <span className="font-display font-bold text-sm">
                    {brand.logo}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 bg-secondary/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Aktuelle Fahrzeuge
              </h2>
              <p className="text-muted-foreground text-lg">
                Entdecken Sie unsere neuesten Zugänge
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="shrink-0">
              <Link href="/fahrzeuge">
                Alle Fahrzeuge
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Car className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                Noch keine Fahrzeuge
              </h3>
              <p className="text-muted-foreground">
                Neue Fahrzeuge werden bald hinzugefügt.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Warum ST Motors?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Wir bieten mehr als nur Fahrzeuge – wir bieten ein erstklassiges
              Kauferlebnis mit persönlicher Beratung.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-secondary/30"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Über ST Motors
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                ST Motors GmbH ist Ihr zuverlässiger Partner für Premium-Gebrauchtwagen
                in Lilienthal bei Bremen. Wir haben uns auf hochwertige SUVs und
                Limousinen spezialisiert und legen größten Wert auf Qualität und
                Kundenzufriedenheit.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                Unser Team verfügt über langjährige Erfahrung im Automobilhandel
                und berät Sie kompetent bei der Auswahl Ihres Traumwagens.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="font-semibold"
                >
                  <Link href="/ueber-uns">Mehr erfahren</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="font-semibold border-white/30 text-white hover:bg-white/10"
                >
                  <Link href="/kontakt">Kontakt aufnehmen</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-2xl bg-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <span className="font-display font-bold text-5xl">ST</span>
                  </div>
                  <p className="text-xl font-semibold">ST Motors GmbH</p>
                  <p className="text-white/60">Premium Automobile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Sie möchten Ihr Fahrzeug verkaufen?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Wir kaufen hochwertige Gebrauchtwagen zu fairen Preisen. Fordern Sie
              jetzt Ihre kostenlose Bewertung an.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
                <Link href="/verkaufen">
                  Kostenlose Bewertung
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold"
              >
                <a href="tel:+4942989099069">
                  <Phone className="mr-2 h-5 w-5" />
                  +49 4298 9099069
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

