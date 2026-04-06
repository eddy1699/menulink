import crypto from 'crypto'
import { PlanType } from '@prisma/client'

const MODE = process.env.IZIPAY_MODE || 'TEST'
const API_URL = process.env.IZIPAY_API_URL!
const USERNAME = process.env.IZIPAY_USERNAME!

// Amounts in centimos (PEN)
export const PLAN_AMOUNTS: Record<PlanType, number> = {
  STARTER:  990,   // S/ 9.90
  PRO:      1990,  // S/ 19.90
  BUSINESS: 2990,  // S/ 29.90
}

function getPassword() {
  return MODE === 'PRODUCTION'
    ? process.env.IZIPAY_PROD_PASSWORD!
    : process.env.IZIPAY_TEST_PASSWORD!
}

export function getPublicKey() {
  return MODE === 'PRODUCTION'
    ? process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY_PROD!
    : process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY_TEST!
}

export function getHmacKey() {
  return MODE === 'PRODUCTION'
    ? process.env.IZIPAY_HMAC_PROD!
    : process.env.IZIPAY_HMAC_TEST!
}

function getAuthHeader() {
  const credentials = Buffer.from(`${USERNAME}:${getPassword()}`).toString('base64')
  return `Basic ${credentials}`
}

interface CreateFormTokenParams {
  orderId: string
  plan: PlanType
  email: string
  restaurantId: string
}

export async function createFormToken(params: CreateFormTokenParams) {
  const { orderId, plan, email, restaurantId } = params
  const amount = PLAN_AMOUNTS[plan]

  const res = await fetch(`${API_URL}/api-payment/V4/Charge/CreatePayment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      amount,
      currency: 'PEN',
      orderId,
      customer: {
        email,
        reference: restaurantId,
      },
      transactionOptions: {
        cardOptions: {
          paymentSource: 'EC',
        },
      },
    }),
  })

  const data = await res.json()

  if (data.status !== 'SUCCESS') {
    throw new Error(data.answer?.errorMessage || 'Error al crear token de pago')
  }

  return data.answer.formToken as string
}

export function verifySignature(clientAnswerJson: string, hash: string): boolean {
  const key = getHmacKey()
  const computed = crypto
    .createHmac('sha256', key)
    .update(clientAnswerJson)
    .digest('hex')
  return computed === hash
}

export function generateOrderId(restaurantId: string): string {
  return `MENUQR-${restaurantId.slice(-8).toUpperCase()}-${Date.now()}`
}
