"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cookie, Settings2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

const COOKIE_CONSENT_KEY = "st-motors-cookie-consent"

export function CookieBanner() {
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  })

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      // Check if consent was already given
      const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (savedConsent) {
        const parsed = JSON.parse(savedConsent) as CookieConsent
        // Check if consent is older than 1 year
        const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
        if (parsed.timestamp > oneYearAgo) {
          setConsent(parsed)
          return
        }
      }
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } catch (error) {
      // If localStorage is not available, show banner
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [mounted])

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() }
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp))
    } catch (error) {
      console.error("Could not save cookie consent:", error)
    }
    setConsent(consentWithTimestamp)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    })
  }

  const saveSelection = () => {
    saveConsent(consent)
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted || !showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white border-t shadow-2xl">
          <div className="container-custom py-4 md:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Icon & Text */}
              <div className="flex items-start gap-4 flex-1">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-primary/10 items-center justify-center shrink-0">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">
                    Wir verwenden Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Wir nutzen Cookies, um Ihnen die bestmögliche Nutzung unserer
                    Webseite zu ermöglichen. Einige Cookies sind technisch notwendig,
                    andere helfen uns, die Webseite zu verbessern.{" "}
                    <Link
                      href="/datenschutz"
                      className="underline hover:text-primary"
                    >
                      Mehr erfahren
                    </Link>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings2 className="h-4 w-4" />
                  Einstellungen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                >
                  Nur notwendige
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  Alle akzeptieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Cookie-Einstellungen
            </DialogTitle>
            <DialogDescription>
              Wählen Sie aus, welche Cookies Sie zulassen möchten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 bg-secondary/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Notwendige Cookies</span>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Immer aktiv
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Diese Cookies sind für die Grundfunktionen der Website erforderlich
                  und können nicht deaktiviert werden.
                </p>
              </div>
              <input
                type="checkbox"
                checked={consent.necessary}
                disabled
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
              <div className="space-y-1">
                <span className="font-medium">Analyse-Cookies</span>
                <p className="text-sm text-muted-foreground">
                  Diese Cookies helfen uns, die Nutzung unserer Website zu verstehen
                  und zu verbessern.
                </p>
              </div>
              <input
                type="checkbox"
                checked={consent.analytics}
                onChange={(e) =>
                  setConsent((prev) => ({ ...prev, analytics: e.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
              <div className="space-y-1">
                <span className="font-medium">Marketing-Cookies</span>
                <p className="text-sm text-muted-foreground">
                  Diese Cookies werden verwendet, um Werbung relevanter für Sie zu
                  gestalten.
                </p>
              </div>
              <input
                type="checkbox"
                checked={consent.marketing}
                onChange={(e) =>
                  setConsent((prev) => ({ ...prev, marketing: e.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={acceptNecessary}>
              Nur notwendige
            </Button>
            <Button onClick={saveSelection}>Auswahl speichern</Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Weitere Informationen finden Sie in unserer{" "}
            <Link
              href="/datenschutz"
              className="underline hover:text-primary"
              onClick={() => setShowSettings(false)}
            >
              Datenschutzerklärung
            </Link>
            .
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Hook to check cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (savedConsent) {
        setConsent(JSON.parse(savedConsent))
      }
    } catch (error) {
      console.error("Could not read cookie consent:", error)
    }
  }, [])

  return consent
}

