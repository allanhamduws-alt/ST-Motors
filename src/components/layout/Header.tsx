"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Phone, Mail, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

const navigation = [
  { name: "Startseite", href: "/" },
  { name: "Fahrzeuge", href: "/fahrzeuge" },
  { name: "Fahrzeug verkaufen", href: "/verkaufen" },
  { name: "Blog", href: "/blog" },
  { name: "Über uns", href: "/ueber-uns" },
  { name: "Kontakt", href: "/kontakt" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-primary text-primary-foreground py-2">
        <div className="container-custom">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a
                href="tel:+4942989099069"
                className="flex items-center gap-2 hover:text-white/80 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+49 4298 9099069</span>
              </a>
              <a
                href="mailto:info@stmotors.de"
                className="flex items-center gap-2 hover:text-white/80 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@stmotors.de</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Am Wolfsberg 4, 28865 Lilienthal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white"
        }`}
      >
        <div className="container-custom">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/images/logo.svg"
                alt="ST Motors - Premium Automobile"
                width={200}
                height={50}
                className="h-12 w-auto transform group-hover:scale-105 transition-transform"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/fahrzeuge">Fahrzeuge entdecken</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b">
                    <Image
                      src="/images/logo.svg"
                      alt="ST Motors - Premium Automobile"
                      width={180}
                      height={45}
                      className="h-11 w-auto"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 p-6">
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <SheetClose asChild key={item.name}>
                          <Link
                            href={item.href}
                            className="flex items-center px-4 py-3 text-lg font-medium hover:bg-secondary rounded-lg transition-colors"
                          >
                            {item.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Contact */}
                  <div className="p-6 bg-secondary/50 space-y-4">
                    <a
                      href="tel:+4942989099069"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span>+49 4298 9099069</span>
                    </a>
                    <a
                      href="mailto:info@stmotors.de"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span>info@stmotors.de</span>
                    </a>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>Am Wolfsberg 4, 28865 Lilienthal</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

