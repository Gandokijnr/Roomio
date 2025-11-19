<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-4xl bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-10">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight">Billing & Subscription</h1>
            <p class="mt-1 text-sm text-slate-400">
              Manage your Roomio subscription.
              You can cancel your trial at any time. Payment is only required after your 14-day trial to unlock the first paid month.
            </p>
          </div>
          <div class="text-right">
            <p
              v-if="billingStatus"
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              :class="statusBadgeClass"
            >
              <span class="w-2 h-2 rounded-full mr-2" :class="statusDotClass" />
              {{ billingStatusLabel }}
            </p>
          </div>
        </div>

        <div v-if="loading" class="py-10 text-center text-slate-400 text-sm">
          Checking your billing status...
        </div>

        <div v-else class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <section>
            <h2 class="text-sm font-medium text-slate-200 mb-3">Choose a plan</h2>
            <div class="grid gap-4 md:grid-cols-2">
              <button
                v-for="plan in plans"
                :key="plan.id"
                type="button"
                class="group relative flex flex-col items-stretch rounded-xl border bg-slate-900/60 p-4 text-left transition hover:border-royal-gold-500 hover:bg-slate-900"
                :class="{
                  'border-royal-gold-500 ring-1 ring-royal-gold-500/60': selectedPlanId === plan.id
                }"
                @click="selectedPlanId = plan.id"
              >
                <div class="flex items-center justify-between gap-2 mb-1">
                  <p class="text-sm font-semibold text-slate-50">{{ plan.name }}</p>
                  <p class="text-xs uppercase tracking-wide text-royal-gold-300" v-if="plan.code === 'premium'">
                    Recommended
                  </p>
                </div>
                <p class="text-lg font-semibold text-royal-gold-300">
                  ₦{{ formatAmount(plan.price_monthly) }}
                  <span class="text-xs font-normal text-slate-400"> / month</span>
                </p>
                <ul class="mt-3 space-y-1.5 text-xs text-slate-400">
                  <li
                    v-for="(feature, idx) in (plan.features || [])"
                    :key="idx"
                    class="flex items-start gap-2"
                  >
                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-royal-gold-400" />
                    <span>{{ feature }}</span>
                  </li>
                </ul>
              </button>
              <p v-if="!plans.length" class="text-xs text-slate-500 col-span-full">
                No subscription plans are configured yet. Please contact support.
              </p>
            </div>
          </section>

          <section class="space-y-4">
            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 class="text-sm font-medium text-slate-200 mb-2">Current status</h2>
              <p v-if="billingStatus === 'trial'" class="text-xs text-slate-400">
                You are currently on a free trial. Your trial ends on
                <span class="font-medium text-slate-200">{{ formatDate(billingInfo.trial_end_date) }}</span>.
              </p>
              <p v-else-if="billingStatus === 'billing_hold'" class="text-xs text-slate-400">
                Your trial has ended. Please complete your subscription payment to continue using Roomio.
              </p>
              <p v-else-if="billingStatus === 'active'" class="text-xs text-slate-400">
                Your subscription is active until
                <span class="font-medium text-slate-200">{{ formatDate(billingInfo.subscription_end_date) }}</span>.
              </p>
              <p v-else-if="billingStatus === 'suspended'" class="text-xs text-rose-300">
                Your subscription is suspended. Please retry payment to restore access.
              </p>
              <p v-else class="text-xs text-slate-400">
                We could not determine your billing status. Please try again or contact support.
              </p>
            </div>

            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 class="text-sm font-medium text-slate-200 mb-3">Complete payment</h2>
              <p class="text-xs text-slate-400 mb-3">
                Select a plan and continue to Paystack to securely complete your payment.
              </p>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg bg-royal-gold-500 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-royal-gold-600 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!selectedPlanId || initializing || billingStatus === 'active'"
                @click="initializePayment"
              >
                <span v-if="!initializing">Continue to Paystack</span>
                <span v-else>Initializing payment...</span>
              </button>
              <p v-if="error" class="mt-2 text-xs text-rose-300">
                {{ error }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 class="text-sm font-medium text-slate-200 mb-2">Subscription details</h2>
              <dl class="space-y-1 text-xs text-slate-400">
                <div class="flex justify-between">
                  <dt class="text-slate-500">Current plan</dt>
                  <dd class="text-slate-200">{{ currentPlanName }}</dd>
                </div>
                <div class="flex justify-between" v-if="billingInfo.trial_end_date">
                  <dt class="text-slate-500">Trial ends</dt>
                  <dd class="text-slate-200">{{ formatDate(billingInfo.trial_end_date) }}</dd>
                </div>
                <div class="flex justify-between" v-if="billingInfo.subscription_end_date">
                  <dt class="text-slate-500">Next billing date</dt>
                  <dd class="text-slate-200">{{ formatDate(billingInfo.subscription_end_date) }}</dd>
                </div>
              </dl>
              <div class="mt-3 flex gap-2">
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  @click="changePlan"
                >
                  Change plan
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  @click="updatePaymentMethod"
                >
                  Update payment method
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900/60 disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="cardSetupLoading"
                  @click="setupCardForRenewals"
                >
                  <span v-if="!cardSetupLoading">Save card for automatic renewals</span>
                  <span v-else>Redirecting to Paystack…</span>
                </button>
              </div>
              <p class="mt-2 text-[11px] text-slate-500">
                We use a small verification charge to securely save your card with Paystack. Your full subscription is only charged on your billing date.
              </p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 class="text-sm font-medium text-slate-200 mb-2">Payment history</h2>
              <p v-if="loadingHistory" class="text-xs text-slate-500">Loading payment history...</p>
              <p v-else-if="!paymentHistory.length" class="text-xs text-slate-500">
                No subscription payments recorded yet.
              </p>
              <ul v-else class="space-y-1 max-h-40 overflow-y-auto text-xs text-slate-400">
                <li
                  v-for="event in paymentHistory"
                  :key="event.id"
                  class="flex justify-between gap-2"
                >
                  <span>{{ formatDateTime(event.created_at) }}</span>
                  <span class="text-right">
                    <span class="font-medium" :class="event.event_type === 'PAYMENT_SUCCESS' ? 'text-emerald-300' : 'text-rose-300'">
                      {{ event.event_type === 'PAYMENT_SUCCESS' ? 'Success' : 'Failed' }}
                    </span>
                    <span v-if="event.details?.amount" class="ml-1">
                      · ₦{{ formatAmount(event.details.amount / 100) }}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { $supabase } = useNuxtApp() as any

const loading = ref(true)
const initializing = ref(false)
const error = ref<string | null>(null)

const billingInfo = reactive({
  status: '' as string,
  trial_end_date: null as string | null,
  subscription_end_date: null as string | null,
  current_plan_id: null as string | null
})

const plans = ref<any[]>([])
const selectedPlanId = ref<string | null>(null)
const currentPlanName = computed(() => {
  if (!billingInfo.current_plan_id) return 'No plan selected'
  const match = plans.value.find((p: any) => p.id === billingInfo.current_plan_id)
  return match?.name || 'Custom'
})

const loadingHistory = ref(false)
const paymentHistory = ref<any[]>([])
const cardSetupLoading = ref(false)

const billingStatus = computed(() => billingInfo.status)

const billingStatusLabel = computed(() => {
  switch (billingInfo.status) {
    case 'trial':
      return 'On Trial'
    case 'billing_hold':
      return 'Payment Required'
    case 'active':
      return 'Active Subscription'
    case 'suspended':
      return 'Suspended'
    default:
      return 'Unknown'
  }
})

const statusBadgeClass = computed(() => {
  switch (billingInfo.status) {
    case 'trial':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-200'
    case 'billing_hold':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-200'
    case 'active':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    case 'suspended':
      return 'border-rose-500/40 bg-rose-500/10 text-rose-200'
    default:
      return 'border-slate-700 bg-slate-900 text-slate-300'
  }
})

const statusDotClass = computed(() => {
  switch (billingInfo.status) {
    case 'trial':
      return 'bg-amber-400'
    case 'billing_hold':
      return 'bg-amber-400'
    case 'active':
      return 'bg-emerald-400'
    case 'suspended':
      return 'bg-rose-400'
    default:
      return 'bg-slate-500'
  }
})

const formatAmount = (value: any) => {
  const num = Number(value || 0)
  return num.toLocaleString('en-NG', { maximumFractionDigits: 0 })
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadBillingStatus = async () => {
  loading.value = true
  error.value = null

  const { data } = await $supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    loading.value = false
    error.value = 'You must be logged in to view billing.'
    return
  }

  try {
    const res: any = await $fetch('/api/billing/status', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res?.success) {
      throw new Error('Failed to load billing status')
    }

    const tenant = res.data.tenant
    billingInfo.status = tenant.status
    billingInfo.trial_end_date = tenant.trial_end_date
    billingInfo.subscription_end_date = tenant.subscription_end_date
    billingInfo.current_plan_id = tenant.current_plan_id

    plans.value = res.data.available_plans || []

    if (!selectedPlanId.value && billingInfo.current_plan_id) {
      selectedPlanId.value = billingInfo.current_plan_id
    }
  } catch (e: any) {
    console.error('Failed to load billing status:', e)
    error.value = e?.message || 'Failed to load billing status.'
  } finally {
    loading.value = false
  }
}

const loadPaymentHistory = async () => {
  loadingHistory.value = true

  const { data } = await $supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    loadingHistory.value = false
    return
  }

  try {
    const res: any = await $fetch('/api/billing/history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res?.success) {
      throw new Error('Failed to load payment history')
    }

    paymentHistory.value = res.data.events || []
  } catch (e: any) {
    console.error('Failed to load payment history:', e)
  } finally {
    loadingHistory.value = false
  }
}

const changePlan = () => {
  if (!plans.value.length) return
  const current = plans.value.find((p: any) => p.id === billingInfo.current_plan_id)
  if (current && current.id) {
    selectedPlanId.value = current.id
  }
}

const updatePaymentMethod = () => {
  if (!selectedPlanId.value && billingInfo.current_plan_id) {
    selectedPlanId.value = billingInfo.current_plan_id
  }
  if (!selectedPlanId.value) return
  initializePayment()
}

const initializePayment = async () => {
  if (!selectedPlanId.value) return
  initializing.value = true
  error.value = null

  const { data } = await $supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    initializing.value = false
    error.value = 'You must be logged in to start payment.'
    return
  }

  try {
    const res: any = await $fetch('/api/billing/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        plan_id: selectedPlanId.value
      }
    })

    if (!res?.success || !res.data?.authorization_url) {
      throw new Error('Failed to initialize payment.')
    }

    window.location.href = res.data.authorization_url
  } catch (e: any) {
    console.error('Payment initialization failed:', e)
    error.value = e?.statusMessage || e?.message || 'Failed to initialize payment.'
  } finally {
    initializing.value = false
  }
}

const setupCardForRenewals = async () => {
  if (!selectedPlanId.value && billingInfo.current_plan_id) {
    selectedPlanId.value = billingInfo.current_plan_id
  }

  if (!selectedPlanId.value || cardSetupLoading.value) return

  cardSetupLoading.value = true
  error.value = null

  const { data } = await $supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    cardSetupLoading.value = false
    error.value = 'You must be logged in to save a card.'
    return
  }

  try {
    const res: any = await $fetch('/api/billing/card-setup', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        plan_id: selectedPlanId.value
      }
    })

    if (!res?.success || !res.data?.authorization_url) {
      throw new Error('Failed to initialize card setup.')
    }

    window.location.href = res.data.authorization_url
  } catch (e: any) {
    console.error('Card setup initialization failed:', e)
    error.value = e?.statusMessage || e?.message || 'Failed to initialize card setup.'
  } finally {
    cardSetupLoading.value = false
  }
}

onMounted(() => {
  loadBillingStatus()
  loadPaymentHistory()
})
</script>
