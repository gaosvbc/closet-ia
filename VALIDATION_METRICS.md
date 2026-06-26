# Validation Metrics

How we decide whether Visual Closet Tracker is worth building. Run the landing
page, demo, and waitlist, then measure against the criteria below.

> Run for a **minimum of 14 days** before making any GO / NO-GO decision. Early
> traffic is noisy; give the signal time to stabilise.

---

## GO criteria — all three required

A clear green light. Proceed to build the real product.

| Metric | Threshold |
| --- | --- |
| **Waitlist conversion rate** | ≥ **5%** of total visitors join the waitlist |
| **Survey completion rate** | ≥ **60%** of signups complete the onboarding survey |
| **Plan votes** | ≥ **35%** select **Basic or Pro** (any billing period) |

All three must be met. Two out of three is a weak signal, not a GO.

## Weak signal — iterate, don't quit

Worth another cycle of copy or design before deciding.

- **Conversion 2–5%** → test a different headline or sharpen the demo.
- **Mostly Free votes** → the value proposition needs stronger framing; the
  product idea may be fine but the pitch isn't landing.

## NO-GO

Stop or pivot.

- **Conversion < 2%** after two distinct copy iterations.
- **Less than 15%** of respondents indicate any willingness to pay
  (survey Q4 "Yes" or "Maybe", plus Basic/Pro plan votes).

---

## Where each number comes from

All metrics are visible in the `/admin` dashboard once Supabase is connected.

| Metric | Source |
| --- | --- |
| Total visitors | Your analytics provider (e.g. Vercel Analytics, Plausible). The app records key interactions to `page_events`, but you still need a visitor count to compute conversion. |
| Waitlist signups | `leads` table — shown as **Total waitlist signups**. |
| Survey completion rate | `survey_responses` ÷ `leads` — shown directly. |
| Plan preference | `price_votes` table — shown as **Plan preference breakdown**. |
| Billing preference | `price_votes.billing_preference` — shown as **Billing preference**. |
| Willingness to pay | Survey Q4 (`q4_would_pay`) + Basic/Pro plan votes. |
| Feature demand | `feature_votes` table — shown ranked by popularity. |

### Computing conversion rate

```
waitlist conversion = total waitlist signups ÷ total unique visitors
```

The dashboard shows the numerator. Pull the denominator from your web
analytics, then compute the rate for your reporting window.

---

## Suggested 14-day cadence

1. **Day 0** — deploy, connect analytics, confirm events are landing.
2. **Days 1–7** — drive traffic from one or two channels. Don't change copy yet.
3. **Day 7** — first read. If conversion < 2%, prepare a headline/demo variant.
4. **Days 8–14** — run the variant if needed.
5. **Day 14** — evaluate against GO / Weak / NO-GO above and decide.

## Honest caveats

- Waitlist intent over-states real purchase intent — discount accordingly.
- Small samples swing wildly; prefer rates only once you have a few hundred
  visitors.
- "Maybe" on willingness-to-pay is a soft signal, not a sale.
