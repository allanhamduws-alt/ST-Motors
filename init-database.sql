-- ST Motors - Datenbank Initialisierung
-- Führe dieses Script in deiner PostgreSQL Datenbank aus
-- (Supabase SQL Editor, pgAdmin, DBeaver, etc.)

-- ============================================
-- ENUM TYPEN ERSTELLEN
-- ============================================

-- Nur erstellen wenn nicht existiert
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'MITARBEITER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleType" AS ENUM ('PKW', 'SUV', 'KOMBI', 'COUPE', 'CABRIO', 'LIMOUSINE', 'VAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleCondition" AS ENUM ('NEU', 'GEBRAUCHT', 'JAHRESWAGEN', 'VORFUEHRWAGEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleStatus" AS ENUM ('ENTWURF', 'AKTIV', 'RESERVIERT', 'VERKAUFT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FuelType" AS ENUM ('BENZIN', 'DIESEL', 'ELEKTRO', 'HYBRID', 'LPG');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Transmission" AS ENUM ('AUTOMATIK', 'MANUELL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DriveType" AS ENUM ('FRONT', 'HECK', 'ALLRAD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VatType" AS ENUM ('MWST', 'DIFFERENZ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CustomerType" AS ENUM ('PRIVAT', 'GEWERBE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CustomerRole" AS ENUM ('INTERESSENT', 'KAEUFER', 'VERKAEUFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContractType" AS ENUM ('KAUFVERTRAG', 'ANKAUFVERTRAG');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContractStatus" AS ENUM ('ENTWURF', 'AKTIV', 'ABGESCHLOSSEN', 'STORNIERT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('ENTWURF', 'OFFEN', 'BEZAHLT', 'STORNIERT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LeadType" AS ENUM ('FAHRZEUGANFRAGE', 'ANKAUFANFRAGE', 'KONTAKT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LeadStatus" AS ENUM ('NEU', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DocumentType" AS ENUM ('KAUFVERTRAG', 'RECHNUNG', 'FAHRZEUGBRIEF', 'SONSTIGES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PostStatus" AS ENUM ('ENTWURF', 'VEROEFFENTLICHT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELLEN ERSTELLEN
-- ============================================

-- User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MITARBEITER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Vehicle
CREATE TABLE IF NOT EXISTS "Vehicle" (
    "id" TEXT NOT NULL,
    "vehicleNumber" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'PKW',
    "condition" "VehicleCondition" NOT NULL DEFAULT 'GEBRAUCHT',
    "status" "VehicleStatus" NOT NULL DEFAULT 'ENTWURF',
    "vin" TEXT,
    "hsn" TEXT,
    "tsn" TEXT,
    "licensePlate" TEXT,
    "firstRegistration" TIMESTAMP(3),
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "previousOwners" INTEGER NOT NULL DEFAULT 0,
    "fuelType" "FuelType",
    "transmission" "Transmission",
    "powerKW" INTEGER,
    "powerPS" INTEGER,
    "displacement" INTEGER,
    "driveType" "DriveType",
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "features" TEXT[],
    "purchasePrice" DECIMAL(10,2),
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "vatType" "VatType" NOT NULL DEFAULT 'MWST',
    "title" TEXT,
    "description" TEXT,
    "exportMobileDE" BOOLEAN NOT NULL DEFAULT false,
    "exportAutoScout" BOOLEAN NOT NULL DEFAULT false,
    "arrivalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_slug_key" ON "Vehicle"("slug");

-- VehicleImage
CREATE TABLE IF NOT EXISTS "VehicleImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "vehicleId" TEXT NOT NULL,
    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);

-- Customer
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "customerNumber" SERIAL NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'PRIVAT',
    "role" "CustomerRole" NOT NULL DEFAULT 'INTERESSENT',
    "company" TEXT,
    "salutation" TEXT,
    "firstName" TEXT,
    "lastName" TEXT NOT NULL,
    "street" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Deutschland',
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- Contract
CREATE TABLE IF NOT EXISTS "Contract" (
    "id" TEXT NOT NULL,
    "contractNumber" SERIAL NOT NULL,
    "type" "ContractType" NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "priceNet" DECIMAL(10,2) NOT NULL,
    "vat" DECIMAL(10,2) NOT NULL,
    "priceGross" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "notes" TEXT,
    "isAccidentFree" BOOLEAN NOT NULL DEFAULT true,
    "reducedLiability" BOOLEAN NOT NULL DEFAULT false,
    "hasWarranty" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContractStatus" NOT NULL DEFAULT 'ENTWURF',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- Invoice
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "contractId" TEXT,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "vatAmount" DECIMAL(10,2) NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OFFEN',
    "paidDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- InvoicePosition
CREATE TABLE IF NOT EXISTS "InvoicePosition" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "InvoicePosition_pkey" PRIMARY KEY ("id")
);

-- Lead
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEU',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "vehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Document
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "vehicleId" TEXT,
    "customerId" TEXT,
    "contractId" TEXT,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- BlogPost
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'ENTWURF',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");

-- ============================================
-- FOREIGN KEYS
-- ============================================

-- Vehicle -> User
ALTER TABLE "Vehicle" DROP CONSTRAINT IF EXISTS "Vehicle_createdById_fkey";
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- VehicleImage -> Vehicle
ALTER TABLE "VehicleImage" DROP CONSTRAINT IF EXISTS "VehicleImage_vehicleId_fkey";
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleId_fkey" 
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contract -> Customer
ALTER TABLE "Contract" DROP CONSTRAINT IF EXISTS "Contract_customerId_fkey";
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Contract -> Vehicle
ALTER TABLE "Contract" DROP CONSTRAINT IF EXISTS "Contract_vehicleId_fkey";
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_vehicleId_fkey" 
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Contract -> User
ALTER TABLE "Contract" DROP CONSTRAINT IF EXISTS "Contract_createdById_fkey";
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invoice -> Customer
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_customerId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invoice -> Contract
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_contractId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" 
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Invoice -> User
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_createdById_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- InvoicePosition -> Invoice
ALTER TABLE "InvoicePosition" DROP CONSTRAINT IF EXISTS "InvoicePosition_invoiceId_fkey";
ALTER TABLE "InvoicePosition" ADD CONSTRAINT "InvoicePosition_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lead -> Vehicle
ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_vehicleId_fkey";
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vehicleId_fkey" 
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Document -> Vehicle
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_vehicleId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_vehicleId_fkey" 
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Document -> Customer
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_customerId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Document -> Contract
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_contractId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_contractId_fkey" 
    FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Document -> Invoice
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_invoiceId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- ADMIN USER ERSTELLEN
-- ============================================

-- Standard Admin-User (Passwort: admin123 - UNBEDINGT ÄNDERN!)
-- Das Passwort ist bcrypt-gehasht
INSERT INTO "User" (id, email, password, name, role, "createdAt")
VALUES (
    'cladmin001',
    'admin@stmotors.de',
    '$2b$10$rXnqKvGH6Y8KQzPvQ5FQd.1QvLnxOlHHvN5LQYXqWbJ8LZrGkKzKG',
    'Administrator',
    'ADMIN',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FERTIG!
-- ============================================

SELECT 'Datenbank erfolgreich initialisiert!' as status;
SELECT 'Admin Login: admin@stmotors.de / admin123' as hinweis;
SELECT 'WICHTIG: Passwort nach erstem Login ändern!' as warnung;

