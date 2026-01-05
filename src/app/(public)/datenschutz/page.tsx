import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der ST Motors GmbH.",
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-16">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold mb-8">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                1. Datenschutz auf einen Blick
              </h2>
              <h3 className="font-semibold text-lg mt-4 mb-2">
                Allgemeine Hinweise
              </h3>
              <p className="text-muted-foreground">
                Die folgenden Hinweise geben einen einfachen Überblick darüber,
                was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
                Website besuchen. Personenbezogene Daten sind alle Daten, mit
                denen Sie persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                2. Verantwortliche Stelle
              </h2>
              <p className="text-muted-foreground">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser
                Website ist:
              </p>
              <p className="text-muted-foreground mt-2">
                ST Motors GmbH
                <br />
                Am Wolfsberg 4<br />
                28865 Lilienthal
                <br />
                <br />
                Telefon: +49 4298 9099069
                <br />
                E-Mail: info@stmotors.de
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                3. Datenerfassung auf dieser Website
              </h2>

              <h3 className="font-semibold text-lg mt-4 mb-2">
                Wer ist verantwortlich für die Datenerfassung?
              </h3>
              <p className="text-muted-foreground">
                Die Datenverarbeitung auf dieser Website erfolgt durch den
                Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum
                dieser Website entnehmen.
              </p>

              <h3 className="font-semibold text-lg mt-4 mb-2">
                Wie erfassen wir Ihre Daten?
              </h3>
              <p className="text-muted-foreground">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
                mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie
                in ein Kontaktformular eingeben.
              </p>
              <p className="text-muted-foreground mt-2">
                Andere Daten werden automatisch oder nach Ihrer Einwilligung
                beim Besuch der Website durch unsere IT-Systeme erfasst. Das
                sind vor allem technische Daten (z. B. Internetbrowser,
                Betriebssystem oder Uhrzeit des Seitenaufrufs).
              </p>

              <h3 className="font-semibold text-lg mt-4 mb-2">
                Wofür nutzen wir Ihre Daten?
              </h3>
              <p className="text-muted-foreground">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie
                Bereitstellung der Website zu gewährleisten. Andere Daten können
                zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>

              <h3 className="font-semibold text-lg mt-4 mb-2">
                Welche Rechte haben Sie bezüglich Ihrer Daten?
              </h3>
              <p className="text-muted-foreground">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über
                Herkunft, Empfänger und Zweck Ihrer gespeicherten
                personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                4. Hosting
              </h2>
              <p className="text-muted-foreground">
                Diese Website wird bei einem externen Dienstleister gehostet
                (Vercel Inc.). Die personenbezogenen Daten, die auf dieser
                Website erfasst werden, werden auf den Servern des Hosters
                gespeichert.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                5. Allgemeine Hinweise und Pflichtinformationen
              </h2>

              <h3 className="font-semibold text-lg mt-4 mb-2">Datenschutz</h3>
              <p className="text-muted-foreground">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen
                Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
                vertraulich und entsprechend der gesetzlichen
                Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h3 className="font-semibold text-lg mt-4 mb-2">SSL-Verschlüsselung</h3>
              <p className="text-muted-foreground">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der
                Übertragung vertraulicher Inhalte eine SSL-Verschlüsselung. Eine
                verschlüsselte Verbindung erkennen Sie daran, dass die
                Adresszeile des Browsers von &quot;http://&quot; auf
                &quot;https://&quot; wechselt.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                6. Datenerfassung auf dieser Website
              </h2>

              <h3 className="font-semibold text-lg mt-4 mb-2">Cookies</h3>
              <p className="text-muted-foreground">
                Unsere Internetseiten verwenden teilweise so genannte Cookies.
                Cookies richten auf Ihrem Rechner keinen Schaden an und
                enthalten keine Viren. Cookies dienen dazu, unser Angebot
                nutzerfreundlicher, effektiver und sicherer zu machen.
              </p>

              <h3 className="font-semibold text-lg mt-4 mb-2">Kontaktformular</h3>
              <p className="text-muted-foreground">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen,
                werden Ihre Angaben aus dem Anfrageformular inklusive der von
                Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der
                Anfrage und für den Fall von Anschlussfragen bei uns
                gespeichert.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                7. Ihre Rechte
              </h2>
              <p className="text-muted-foreground">
                Sie haben folgende Rechte:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">
                8. Aktualität und Änderung dieser Datenschutzerklärung
              </h2>
              <p className="text-muted-foreground">
                Diese Datenschutzerklärung ist aktuell gültig und hat den Stand
                Januar 2026.
              </p>
              <p className="text-muted-foreground mt-2">
                Durch die Weiterentwicklung unserer Website und Angebote darüber
                oder aufgrund geänderter gesetzlicher beziehungsweise
                behördlicher Vorgaben kann es notwendig werden, diese
                Datenschutzerklärung zu ändern.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

