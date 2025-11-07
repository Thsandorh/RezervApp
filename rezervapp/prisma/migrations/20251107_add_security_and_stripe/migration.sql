-- Add security fields to Staff table
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "lockoutUntil" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "lastLoginIP" TEXT;

-- Add Stripe configuration to Restaurant table
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "stripeSecretKey" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "stripeWebhookSecret" TEXT;

-- Create LoginAttempt table
CREATE TABLE IF NOT EXISTS "LoginAttempt" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "email" TEXT,
    "success" BOOLEAN NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoginAttempt_email_createdAt_idx" ON "LoginAttempt"("email", "createdAt");
