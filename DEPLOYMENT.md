# ST Motors - Deployment Guide für Coolify (Hetzner)

## 🚀 Deployment auf Coolify + Hetzner Server

### Voraussetzungen

1. [Coolify](https://coolify.io) auf deinem Hetzner Server installiert
2. PostgreSQL Datenbank (kann über Coolify erstellt werden)
3. [Uploadthing Account](https://uploadthing.com) (kostenlos bis 2GB)
4. Domain mit DNS-Zugang

---

## 📊 Schritt 1: PostgreSQL Datenbank in Coolify

### 1.1 Neue Datenbank erstellen

1. Öffne Coolify Dashboard
2. Gehe zu **Resources** → **+ New** → **Database**
3. Wähle **PostgreSQL**
4. Konfiguriere:
   - **Name**: `st-motors-db`
   - **Version**: `16` (empfohlen)
   - **Database Name**: `stmotors`
   - **Username**: `stmotors`
   - **Password**: Generiere ein sicheres Passwort
5. Klicke auf **Deploy**

### 1.2 Connection String notieren

Nach dem Deployment findest du den Connection String unter **Connect**:
```
postgresql://stmotors:PASSWORT@st-motors-db:5432/stmotors
```

**Wichtig:** Für interne Verbindungen in Coolify verwende den internen Hostnamen (Service-Name).

---

## 📁 Schritt 2: Uploadthing einrichten

### 2.1 Projekt erstellen

1. Gehe zu [uploadthing.com](https://uploadthing.com)
2. Erstelle eine neue App
3. Kopiere den `UPLOADTHING_TOKEN`
4. Füge deine Domain zu den erlaubten Origins hinzu

---

## 🔐 Schritt 3: Umgebungsvariablen

Diese Variablen werden in Coolify unter **Environment Variables** eingetragen:

```env
# Database (interner Coolify-Hostname)
DATABASE_URL="postgresql://stmotors:PASSWORT@st-motors-db:5432/stmotors"

# NextAuth
NEXTAUTH_URL="https://stmotors.de"
NEXTAUTH_SECRET="dein-geheimer-schluessel-min-32-zeichen-lang"

# Uploadthing
UPLOADTHING_TOKEN="dein-uploadthing-token"

# Site URL (für SEO und Links)
NEXT_PUBLIC_SITE_URL="https://stmotors.de"
```

### NEXTAUTH_SECRET generieren:

```bash
openssl rand -base64 32
```

---

## 🐳 Schritt 4: Application in Coolify erstellen

### 4.1 Neues Projekt

1. Gehe zu **Projects** → **+ Add**
2. Name: `ST Motors`

### 4.2 Application hinzufügen

1. Im Projekt: **+ New** → **Application**
2. Wähle **Dockerfile** als Build Pack
3. Verbinde dein Git Repository:
   - **Repository URL**: `https://github.com/dein-repo/st-motors`
   - **Branch**: `main`
   - **Build Directory**: `/` (oder `/st-motors` falls Monorepo)

### 4.3 Build Konfiguration

- **Build Pack**: Dockerfile
- **Dockerfile Location**: `Dockerfile`
- **Port**: `3000`

### 4.4 Umgebungsvariablen eintragen

Gehe zu **Environment Variables** und füge alle Variablen aus Schritt 3 hinzu.

**Wichtig:** Markiere sensible Variablen als **Secret**.

---

## 🌐 Schritt 5: Domain verbinden

### 5.1 In Coolify

1. Gehe zu **Domains**
2. Füge hinzu:
   - `stmotors.de`
   - `www.stmotors.de`
3. Aktiviere **SSL** (Let's Encrypt)

### 5.2 DNS-Einträge bei deinem Provider

| Typ | Name | Wert |
|-----|------|------|
| A | @ | DEINE_HETZNER_IP |
| A | www | DEINE_HETZNER_IP |
| AAAA | @ | DEINE_HETZNER_IPV6 (optional) |

---

## 🗃️ Schritt 6: Datenbank migrieren

### Option A: Über Coolify Terminal

1. Gehe zur Application → **Terminal**
2. Führe aus:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Option B: Über SSH auf dem Server

```bash
# In den Container verbinden
docker exec -it <container-name> sh

# Migrationen ausführen
npx prisma migrate deploy
npx prisma db seed
```

### Option C: Bei erstem Deployment (empfohlen)

Füge ein Post-Deployment Script hinzu in Coolify:

**Settings** → **Post Deployment Command**:
```bash
npx prisma migrate deploy
```

---

## 🔄 Schritt 7: Deployment starten

1. Klicke auf **Deploy**
2. Beobachte die Build-Logs
3. Warte bis "Deployment successful"

### Build-Zeit optimieren

Coolify cached Docker Layers automatisch. Der erste Build dauert ca. 3-5 Minuten, folgende Builds sind schneller.

---

## ✅ Schritt 8: Finale Checks

### 8.1 Funktions-Tests

- [ ] Homepage lädt korrekt: `https://stmotors.de`
- [ ] Admin-Login funktioniert: `https://stmotors.de/admin/login`
- [ ] Fahrzeugliste funktioniert
- [ ] Bild-Upload funktioniert
- [ ] Formulare werden gesendet
- [ ] PDF-Export funktioniert

### 8.2 SEO-Checks

- [ ] `/robots.txt` ist erreichbar
- [ ] `/sitemap.xml` ist erreichbar
- [ ] SSL-Zertifikat ist aktiv (grünes Schloss)

### 8.3 Performance

- [ ] Google PageSpeed Insights > 80
- [ ] Keine Console-Errors

---

## 🔄 Updates deployen

### Automatisch (Webhook)

1. In Coolify: **Settings** → **Webhooks** → Kopiere URL
2. In GitHub: **Settings** → **Webhooks** → Füge URL hinzu
3. Jeder Push zu `main` triggert Auto-Deployment

### Manuell

Klicke in Coolify auf **Redeploy**.

---

## 🔧 Coolify-spezifische Einstellungen

### Health Check

**Settings** → **Health Check**:
- **Path**: `/api/auth/session`
- **Interval**: `30`
- **Timeout**: `10`

### Resources (optional)

Falls nötig, Limits anpassen:
- **Memory**: `512MB` - `1GB`
- **CPU**: `0.5` - `1`

### Logs

Logs findest du unter **Logs** in der Application.

---

## 🆘 Troubleshooting

### "Cannot connect to database"

1. Prüfe ob PostgreSQL Container läuft
2. Prüfe DATABASE_URL - interner Hostname verwenden
3. Prüfe Netzwerk-Verbindung in Coolify

### "Prisma Client not found"

Das Dockerfile generiert Prisma Client automatisch. Falls Problem:
```bash
# Im Container
npx prisma generate
```

### Build failed

1. Check Build-Logs in Coolify
2. Stelle sicher dass alle Env-Vars gesetzt sind
3. Prüfe Dockerfile-Syntax

### Bilder werden nicht geladen

1. Prüfe Uploadthing Token
2. Prüfe ob Domain in Uploadthing erlaubt ist
3. Prüfe `next.config.mjs` remote patterns

### 502 Bad Gateway

1. Container startet nicht richtig - prüfe Logs
2. Port-Konfiguration prüfen (sollte 3000 sein)
3. Health Check schlägt fehl - prüfe Endpoint

### Langsame Builds

Docker Layer Caching aktivieren:
- **Settings** → **Enable Docker Layer Caching**

---

## 📊 Monitoring (optional)

### Coolify integrierte Metriken

- CPU/Memory Usage
- Request Count
- Response Times

### Externe Tools

- [Uptime Kuma](https://github.com/louislam/uptime-kuma) - Kann auch in Coolify deployed werden
- [Plausible Analytics](https://plausible.io) - Privacy-friendly Analytics

---

## 🔒 Backup

### Datenbank Backup

In Coolify unter PostgreSQL → **Backups**:
- Aktiviere automatische Backups
- Speichere auf S3-kompatiblem Storage (z.B. Hetzner Object Storage)

### Backup-Frequenz empfohlen

- **Täglich**: Vollständiges DB-Backup
- **Wöchentlich**: Zusätzliches Offsite-Backup

---

## 📞 Support

Bei Fragen zur Webseite: [Entwickler-Kontakt]

Hilfreiche Links:
- [Coolify Docs](https://coolify.io/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Hetzner Cloud Docs](https://docs.hetzner.com)
