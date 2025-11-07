import { prisma } from '@/lib/prisma'

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  // Max login attempts per IP in time window
  maxAttemptsPerIP: 10,
  // Max failed login attempts per email in time window
  maxFailedAttemptsPerEmail: 5,
  // Time window in minutes
  timeWindow: 15,
  // Account lockout duration in minutes after max failed attempts
  lockoutDuration: 30,
}

/**
 * Check if IP address has exceeded rate limit
 */
export async function checkIPRateLimit(ipAddress: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.timeWindow * 60 * 1000)

  const attempts = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      createdAt: {
        gte: windowStart,
      },
    },
  })

  const allowed = attempts < RATE_LIMIT_CONFIG.maxAttemptsPerIP
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxAttemptsPerIP - attempts)

  return { allowed, remaining }
}

/**
 * Check if email has exceeded failed login attempts
 */
export async function checkEmailRateLimit(email: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.timeWindow * 60 * 1000)

  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: windowStart,
      },
    },
  })

  const allowed = failedAttempts < RATE_LIMIT_CONFIG.maxFailedAttemptsPerEmail
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxFailedAttemptsPerEmail - failedAttempts)

  return { allowed, remaining }
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(data: {
  ipAddress: string
  email?: string
  success: boolean
  userAgent?: string
}): Promise<void> {
  await prisma.loginAttempt.create({
    data,
  })

  // Clean up old login attempts (older than 24 hours)
  const cleanupThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000)
  await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: cleanupThreshold,
      },
    },
  })
}

/**
 * Check if staff account is locked out
 */
export async function checkAccountLockout(staffId: string): Promise<{
  locked: boolean
  lockoutUntil: Date | null
}> {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: { lockoutUntil: true },
  })

  if (!staff) {
    return { locked: false, lockoutUntil: null }
  }

  const now = new Date()
  const locked = staff.lockoutUntil ? staff.lockoutUntil > now : false

  return { locked, lockoutUntil: staff.lockoutUntil }
}

/**
 * Increment failed login attempts for staff account
 */
export async function incrementFailedAttempts(email: string): Promise<void> {
  const staff = await prisma.staff.findUnique({
    where: { email },
  })

  if (!staff) return

  const failedAttempts = staff.failedLoginAttempts + 1

  // Lock account if max attempts reached
  const lockoutUntil = failedAttempts >= RATE_LIMIT_CONFIG.maxFailedAttemptsPerEmail
    ? new Date(Date.now() + RATE_LIMIT_CONFIG.lockoutDuration * 60 * 1000)
    : null

  await prisma.staff.update({
    where: { email },
    data: {
      failedLoginAttempts,
      lockoutUntil,
    },
  })
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedAttempts(email: string, ipAddress: string): Promise<void> {
  await prisma.staff.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLoginAt: new Date(),
      lastLoginIP: ipAddress,
    },
  })
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP (common in proxied environments)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP.trim()
  }

  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }

  // Fallback
  return '0.0.0.0'
}
