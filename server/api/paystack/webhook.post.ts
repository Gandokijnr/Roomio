import { createHmac } from 'crypto'
import { handlePaystackChargeFailure, handlePaystackChargeSuccess } from '../../utils/handlePaystackCharge'

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event)

  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty webhook body'
    })
  }

  const config = useRuntimeConfig()
  const signature =
    event.node.req.headers['x-paystack-signature'] ||
    event.node.req.headers['X-Paystack-Signature']

  if (!signature || Array.isArray(signature)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Paystack signature'
    })
  }

  if (!config.paystackWebhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Paystack webhook secret configuration'
    })
  }

  const hash = createHmac('sha512', config.paystackWebhookSecret)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid webhook signature'
    })
  }

  let payload: any

  try {
    payload = JSON.parse(rawBody.toString())
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid webhook JSON'
    })
  }

  const eventName = payload.event
  const data = payload.data || {}

  if (eventName === 'charge.success' && data.status === 'success') {
    await handlePaystackChargeSuccess(data)
  } else if (eventName === 'charge.failed') {
    await handlePaystackChargeFailure(data)
  }

  return { success: true }
})
