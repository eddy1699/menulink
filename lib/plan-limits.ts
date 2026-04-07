import { PlanType } from '@prisma/client'

export const PLAN_LIMITS = {
  STARTER: {
    maxItems: 25,
    maxCategories: 10,
    allowPhotos: false,
    allowAnalytics: false,
    maxMenus: 1,
    maxBranches: 1,
  },
  PRO: {
    maxItems: 80,
    maxCategories: 20,
    allowPhotos: true,
    maxPhotos: 80,
    allowAnalytics: true,
    analyticsLevel: 'basic' as const,
    maxMenus: 3,
    maxBranches: 1,
  },
  BUSINESS: {
    maxItems: Infinity,
    maxCategories: Infinity,
    allowPhotos: true,
    maxPhotos: Infinity,
    allowAnalytics: true,
    analyticsLevel: 'full' as const,
    maxMenus: Infinity,
    maxBranches: Infinity,
  },
} as const

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan]
}

export const PLAN_PRICES = {
  STARTER: 9.90,
  PRO: 19.90,
  BUSINESS: 29.90,
} as const

export const PLAN_NAMES = {
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
} as const
