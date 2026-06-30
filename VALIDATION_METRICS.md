# Validation Metrics

How we decide whether AtelIA is worth building. Run the landing
page, demo, onboarding, and waitlist, then measure against the criteria below.

> Run for a **minimum of 14 days** before making any GO / NO-GO decision. Early
> traffic is noisy; give the signal time to stabilise.

---

## Primary GO criteria — all three required

A clear green light. Proceed to build the real product.

| Metric | Threshold |
| --- | --- |
| **Waitlist conversion rate** | ≥ **5%** of total visitors sign up |
| **Onboarding completion rate** (step 1 → step 5) | ≥ **45%** |
| **Trial intent** | ≥ **40%** indicate willingness to pay (survey Q4 "Yes"/"Maybe") or pick a plan |

> There is no free tier: every plan starts with a 7-day free trial, cancellable
> any time. So plan votes measure paid intent directly, and the premium signal
> is the **Pro share** of plan votes.

All three must be met. Two out of three is a weak signal, not a GO.

## Body-profile metrics — does the differentiator land?

Body intelligence is our #1 differentiator, so we watch it closely.

| Metric | Target / read |
| --- | --- |
| **% completing body measurements** | ≥ **70%** of onboarding users provide height/weight (with consent) |
| **Most common body challenge** | Which option in step 4 dominates — informs positioning |
| **Fit preference distribution** | Relaxed / Regular / Fitted split — informs default styling |

All of these are visible in the `/admin` dashboard once Supabase is connected.

## Weak signal — iterate, don't quit

- **Conversion 2–5%** → test a different headline or sharpen the demo.
- **Body step abandoned > 60%** → measurements feel too invasive; simplify the
  step, soften the consent copy, or make it more clearly optional.
- **Mostly Essential (few Pro) votes** → the premium features (calendar,
  cost-per-wear, packing) aren't landing; strengthen the Pro framing.
- **Many "No" on willingness to pay** → with no free tier, the trial framing or
  price point may be the blocker; test a longer trial or clearer trial messaging.

## NO-GO

Stop or pivot.

- **Conversion < 2%** after two distinct copy iterations.
- **Less than 15%** indicate any willingness to pay (survey Q4 "Yes"/"Maybe" plus
  Essential/Pro plan votes).
- **Body step abandoned > 80%** → pivot the body-intelligence feature itself; the
  core differentiator isn't being accepted.

---

## Where each number comes from

| Metric | Source |
| --- | --- |
| Total visitors | Your analytics provider (e.g. Vercel Analytics, Plausible). Needed to compute conversion. |
| Waitlist signups | `leads` table — **Total waitlist signups**. |
| Onboarding completion | `page_events`: `onboarding_complete` ÷ `onboarding_start` — shown directly. |
| Body measurement rate | `body_profiles` with consent + height ÷ all body profiles — shown directly. |
| Body type / fit distribution | `body_profiles` — shown as distributions. |
| Plan preference + billing | `price_votes` — shown as breakdown + monthly/annual split. |
| Willingness to pay | Survey Q4 (`q4_would_pay`) + Essential/Pro plan votes. |
| Feature demand | `feature_votes` — shown ranked by popularity. |
| Time deciding / wardrobe size | `survey_responses` — average minutes + size distribution. |

### Computing conversion rate

```
waitlist conversion = total signups ÷ total unique visitors
```

The dashboard shows the numerator. Pull the denominator from your web analytics,
then compute the rate for your reporting window.

---

## Suggested 14-day cadence

1. **Day 0** — deploy, connect analytics, confirm events are landing.
2. **Days 1–7** — drive traffic from one or two channels. Don't change copy yet.
3. **Day 7** — first read. If conversion < 2% or body step abandonment is high,
   prepare a variant (headline, demo, or onboarding simplification).
4. **Days 8–14** — run the variant if needed.
5. **Day 14** — evaluate against GO / Weak / NO-GO above and decide.

## Honest caveats

- Waitlist intent over-states real purchase intent — discount accordingly.
- Small samples swing wildly; prefer rates only once you have a few hundred
  visitors.
- "Maybe" on willingness-to-pay is a soft signal, not a sale.
- Onboarding completion is measured from `onboarding_start`/`onboarding_complete`
  events; ad-blockers can suppress events, so treat the rate as a floor.
