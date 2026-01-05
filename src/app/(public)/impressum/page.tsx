import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der ST Motors GmbH in Lilienthal.",
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-16">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold mb-8">Impressum</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Angaben gemäß § 5 TMG
              </h2>
              <p className="text-muted-foreground">
                ST Motors GmbH
                <br />
                Am Wolfsberg 4<br />
                28865 Lilienthal
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Vertreten durch
              </h2>
              <p className="text-muted-foreground">
                Geschäftsführer: Serhat Topcu
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Kontakt
              </h2>
              <p className="text-muted-foreground">
                Telefon: +49 4298 9099069
                <br />
                E-Mail: info@stmotors.de
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Registereintrag
              </h2>
              <p className="text-muted-foreground">
                Eintragung im Handelsregister
                <br />
                Registergericht: Amtsgericht [Ort]
                <br />
                Registernummer: HRB [Nummer]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Umsatzsteuer-ID
              </h2>
              <p className="text-muted-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a
                Umsatzsteuergesetz:
                <br />
                DE [Nummer]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Berufsrechtliche Angaben
              </h2>
              <p className="text-muted-foreground">
                Zuständige Aufsichtsbehörde: IHK Bremen
                <br />
                Kfz-Gewerbe-Zulassung nach § 34a GewO
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                EU-Streitschlichtung
              </h2>
              <p className="text-muted-foreground">
                Die Europäische Kommission stellt eine Plattform zur
                Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                <br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Verbraucherstreitbeilegung
              </h2>
              <p className="text-muted-foreground">
                Wir sind nicht bereit oder verpflichtet, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Haftung für Inhalte
              </h2>
              <p className="text-muted-foreground">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                gespeicherte fremde Informationen zu überwachen oder nach
                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                hinweisen.
              </p>
              <p className="text-muted-foreground mt-4">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                Informationen nach den allgemeinen Gesetzen bleiben hiervon
                unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
                Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
                Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden
                wir diese Inhalte umgehend entfernen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Haftung für Links
              </h2>
              <p className="text-muted-foreground">
                Unser Angebot enthält Links zu externen Websites Dritter, auf
                deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
                diese fremden Inhalte auch keine Gewähr übernehmen. Für die
                Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                oder Betreiber der Seiten verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Urheberrecht
              </h2>
              <p className="text-muted-foreground">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

