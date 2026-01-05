import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react"

const footerLinks = {
  fahrzeuge: [
    { name: "Alle Fahrzeuge", href: "/fahrzeuge" },
    { name: "SUVs", href: "/fahrzeuge?type=SUV" },
    { name: "Limousinen", href: "/fahrzeuge?type=LIMOUSINE" },
    { name: "Neuzugänge", href: "/fahrzeuge?sort=newest" },
  ],
  service: [
    { name: "Fahrzeug verkaufen", href: "/verkaufen" },
    { name: "Finanzierung", href: "/kontakt" },
    { name: "Inzahlungnahme", href: "/verkaufen" },
  ],
  unternehmen: [
    { name: "Über uns", href: "/ueber-uns" },
    { name: "Kontakt", href: "/kontakt" },
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/datenschutz" },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Image
              src="/images/logo-white.svg"
              alt="ST Motors - Premium Automobile"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
            <p className="text-sm text-white/70 leading-relaxed">
              Ihr Spezialist für Premium SUVs und Limousinen in Lilienthal bei
              Bremen. Wir bieten ausgewählte Fahrzeuge von Range Rover, Mercedes,
              BMW, Audi und weiteren Premium-Marken.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Fahrzeuge Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">
              Fahrzeuge
            </h3>
            <ul className="space-y-3">
              {footerLinks.fahrzeuge.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Service</h3>
            <ul className="space-y-3">
              {footerLinks.service.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-display font-semibold text-lg mt-8 mb-6">
              Unternehmen
            </h3>
            <ul className="space-y-3">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+4942989099069"
                  className="flex items-start gap-3 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  <Phone className="h-5 w-5 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>+49 4298 9099069</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@stmotors.de"
                  className="flex items-start gap-3 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  <Mail className="h-5 w-5 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>info@stmotors.de</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Am Wolfsberg 4</div>
                  <div>28865 Lilienthal</div>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Mo-Fr: 09:00 - 18:00</div>
                  <div>Sa: 10:00 - 14:00</div>
                  <div>So: Geschlossen</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <div>© {currentYear} ST Motors GmbH. Alle Rechte vorbehalten.</div>
            <div className="flex items-center gap-6">
              <Link href="/impressum" className="hover:text-white transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="hover:text-white transition-colors">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

