# Monetization & Mobile Strategy — Eatable

Document date: 2026-04-23 (revised 2026-07-11 — build order restructured from calendar phases to trigger-gated milestones; PWA promoted; verification operations/liability added)
Current stack: React 18 + TypeScript + Vite, Appwrite, Cloudinary, Tailwind + shadcn/ui
Live at: eatsharelove.net

---

## Executive Summary

Eatable is free for users, always. Revenue comes from restaurants and food brands who want to reach a high-intent, dietary-restriction audience. This is the Instagram model applied to a niche where the audience is underserved and the B2B buyer has clear, measurable ROI.

**Market context:**
- Diet & Nutrition Apps: $2.4–5.5B market, growing 11–17% annually
- Closest direct competitor (Spokin): 17 employees — no dominant player exists
- Yelp analog: built $1.41B in annual revenue from voluntary reviewers matched to local businesses. Eatable's users have stronger motivation (health/safety), and the B2B buyer (restaurants) has clearer ROI (dietary-restriction diners are loyal and research before visiting)

---

## Revenue Stream 1: Restaurant Verification + Paid Listings

This is the core B2B revenue engine and the product that makes the whole network more valuable.

### Tier Structure

| Tier | Monthly Price | What the Restaurant Gets |
|---|---|---|
| **Unverified** | Free | Basic listing, user-submitted tags, no badge |
| **Verified** | $29–49/mo | "Eatable Verified" badge, dietary tags confirmed by staff, appears in filtered search results |
| **Featured** | $99–199/mo | Everything in Verified + pinned placement in search results for relevant dietary tags, analytics dashboard (views, clicks, saves) |
| **Premium Partner** | $299–499/mo | Everything in Featured + promoted posts in user feed, monthly dietary-specific campaigns, priority support |

### Why Restaurants Pay

People with celiac disease, nut allergies, or strict religious dietary requirements are intensely loyal to restaurants they trust. They research before going, they return repeatedly, and they bring friends and family. A restaurant that captures dietary-restriction diners and can prove their kitchen is safe has a meaningful competitive advantage — the Verified badge signals "we take this seriously" in a way that a Yelp tag cannot.

Dietary-restriction diners also tend to travel further for reliable options and spend more per visit (they're not price-sensitive; they're need-sensitive).

### The Verification Product

Verification is more than a badge. The process confirms:
- Cross-contamination protocols (shared fryers, prep surfaces, utensils)
- Ingredient sourcing and label reading practices
- Staff training on dietary restriction severity
- Menu accuracy (seasonal changes, substitutions)

This due diligence is what separates Eatable from Google Maps with a "gluten-free" tag. The community trusts the badge because the badge means something.

### Verification Operations & Liability — required before the first badge ships

Verification is an operations product, not a feature. Three things must be settled before selling the first badge:

**Who verifies, and what does it cost?** At $29–49/mo, on-site kitchen audits don't pencil out; a structured self-attestation questionnaire plus a phone interview does — but then the standard must be documented, uniform, and re-checked on a schedule, or the badge is exactly the unverified Yelp tag this document claims to beat. Price the verification labor into the tier margins before setting final prices.

**Liability.** A wrong "verified safe" signal to a celiac or nut-allergy user is a potential anaphylaxis lawsuit, not a bad review. Required groundwork: ToS/disclaimer language reviewed by a lawyer, a re-verification cadence (menus and kitchen staff change), a user-facing incident-report mechanism that can suspend a badge immediately, and a liability insurance quote.

**Separate money from trust.** Payment buys placement, analytics, and promotion — never the verification outcome. The standard is identical across tiers and the badge is revocable regardless of what the restaurant pays. This is the defense against the pay-to-play perception that dogged Yelp for a decade.

### Revenue Potential

| Users | Paying Restaurants | Avg Revenue/Restaurant | Monthly Revenue |
|---|---|---|---|
| 10,000 | 50 | $79/mo | $3,950 |
| 50,000 | 300 | $99/mo | $29,700 |
| 100,000 | 700 | $119/mo | $83,300 |
| 200,000 | 1,500 | $129/mo | $193,500 |
| 500,000 | 3,500 | $149/mo | $521,500 |

At 500K users and 3,500 paying restaurants, restaurant listings alone generate ~$6.2M ARR before any ad or affiliate revenue.

---

## Revenue Stream 2: Native Feed Ads

### Why This Audience Commands Premium CPMs

Dietary-restriction users are among the most identifiable, high-intent audiences on the internet. They have documented needs, they search specifically, and they buy specialty products repeatedly. Brands pay more to reach them.

| Audience | CPM Range |
|---|---|
| Generic social media | $3–8 |
| Health & wellness niche | $10–18 |
| Dietary restriction (celiac, allergy-specific) | $15–30 |

A brand selling gluten-free pasta knows that every impression on Eatable reaches someone who actively needs that product. That's 3–5x more valuable than a generic Instagram impression.

### Target Advertisers

- Specialty food brands: Bob's Red Mill, Enjoy Life Foods, Simple Mills, Siete, Miyoko's, So Delicious
- Grocery delivery: Instacart, Amazon Fresh, Thrive Market (they want high-LTV customers)
- Health insurance companies: subsidize wellness apps for their members; high CPM, B2B deal structure
- Supplement and nutrition brands targeting specific dietary communities

### Ad Formats

**Sponsored feed posts** — native posts that look like organic content, labeled "Sponsored." Same card layout as regular posts. Highest engagement, least intrusive.

**Sponsored Explore placements** — branded cards that appear in search results when users filter by dietary tags. Highest purchase intent.

**Dietary guides** — "Best Gluten-Free Restaurants in Chicago, presented by [Brand]." Branded content that provides real value.

### Implementation Path

Phase 1 (manual): Direct outreach to 5–10 specialty food brands. Negotiate flat monthly fees ($500–2,000/mo per brand). No ad tech required.

Phase 2 (semi-automated): Build a simple brand dashboard with impression and click reporting. Stripe for billing. Still sold directly.

Phase 3 (self-serve): Full self-serve ad platform with targeting by dietary tag, geography, and user behavior. Only worth building at 200K+ users.

---

## Revenue Stream 3: Affiliate Commerce

Every product mentioned in a post is a potential revenue event. When a user posts about a gluten-free pasta they love, that post can link to the product. When a follower buys through the link, Eatable earns a commission.

### Affiliate Programs

| Program | Commission Rate | Category |
|---|---|---|
| Thrive Market | 20–30% | Specialty health foods (highest LTV) |
| Amazon Associates | 1–10% by category | General, broad coverage |
| Vitacost | 5–10% | Health foods and supplements |
| iHerb | 5–10% | Supplements, natural foods |
| Direct brand deals | 10–25% | Negotiated per brand |

### "Shop This Post" Feature

Add a product tagging interface to the post creation flow. Users tag up to 5 products (name, brand, dietary tags). Those tags become affiliate-tracked links in the rendered post card.

Zero upfront cost to build the affiliate side. Revenue scales with content volume, but stays modest until that volume is large. Worked example: 50,000 tagged posts/year × ~100 link impressions each = 5M impressions; at 2% click-through and 2% click-to-purchase that's 2,000 orders; at $40 average order value and ~15% blended commission, roughly **$12K/year**. Treat affiliate as a complement to restaurant and ad revenue, not a pillar — and revisit the math with real click data once "Shop This Post" ships.

---

## Revenue Stream 4: Creator Tools

Keep the core app completely free. Charge power users (food bloggers, registered dietitians, allergy advocates, personal chefs) for professional tools.

### Creator Pro — $9/month

- Post analytics: reach, saves, dietary tag performance, follower growth
- Link-in-bio page with affiliate product shelf (up to 10 products)
- "Verified Creator" badge (credibility for dietitians and allergy advocates)
- Priority placement in Explore results

This tier builds the high-quality content that drives organic growth and makes the platform more valuable for everyone. It also creates a recurring revenue base that doesn't depend on restaurant sign-ups.

---

## Mobile Plan: PWA Now, Capacitor at Traction

### Phase A — Ship the PWA first (days of work, no gate)

A Progressive Web App makes Eatable installable from the browser today — no Mac, no developer accounts, no store review. This requires:

1. A `manifest.json` in `public/`:
```json
{
    "name": "Eatable",
    "short_name": "Eatable",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#09090a",
    "theme_color": "#877eff",
    "icons": [
        { "src": "/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}
```

2. A service worker for offline support and install prompts.

Since iOS 16.4 (March 2023), installed home-screen web apps on iOS support Web Push — the old "no push on iOS PWAs" limitation no longer applies. The PWA's real weakness is discoverability: Safari never prompts users to install, and there's no store presence. That's why Capacitor is still worth doing — but only once there's consumer traction to justify it.

### Phase B — Capacitor (build at consumer traction)

#### Why Capacitor, Not React Native

React Native requires rewriting every component. Tailwind CSS doesn't work natively. The entire UI layer — every PostCard, TopBar, BottomBar, form — would need to be rebuilt. That's 3–6 months of work minimum.

Capacitor wraps the existing React + Vite + Tailwind web app in a native iOS/Android shell. The web app renders inside a WebView. Existing components work as-is. Native device APIs (camera, push notifications, GPS) are added via plugins.

**Timeline:** 2–4 weeks to a working mobile build. 1–2 additional weeks for App Store review.

**Spike first (1–2 days) before trusting that estimate:** inside a Capacitor WebView the app is served from a `capacitor://` or localhost origin, not eatsharelove.net, so Appwrite's cookie-based sessions and CORS behave differently than in a normal browser. Verify login and session persistence in the WebView before committing to the integration.

**What you get:**
- App Store (iOS) and Google Play (Android) presence
- Native camera for photo uploads (better UX than browser file picker)
- Push notifications for likes, comments, new restaurant verifications nearby
- GPS for "restaurants near me" discovery
- Full app icon, splash screen, and offline error handling

#### Step-by-Step Capacitor Integration

**Step 1 — Install Capacitor**

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Eatable" "net.eatsharelove.app" --web-dir dist
```

**Step 2 — Add platforms**

```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

**Step 3 — Build and sync**

```bash
npm run build       # builds the Vite app to dist/
npx cap sync        # copies dist/ into iOS and Android native projects
```

**Step 4 — Add native camera plugin** *(optional for launch — `<input type="file" accept="image/*" capture>` already opens the native camera in mobile WebViews, but the plugin helps satisfy Apple's minimum-functionality bar; see App Store Review Risks below)*

Replace the browser `<input type="file">` in `FileUploader.tsx` with Capacitor Camera for a native photo/video picker:

```bash
npm install @capacitor/camera
```

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePhoto = async () => {
    const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
        quality: 85,
    });
    // photo.dataUrl is ready for Cloudinary upload
};
```

**Step 5 — Add push notifications**

```bash
npm install @capacitor/push-notifications
```

Integrate with Firebase Cloud Messaging (FCM) for push delivery. FCM is the industry standard for both iOS and Android and works alongside Appwrite/Supabase.

Use cases: new like/comment on your post, new restaurant verification in your city, weekly "top posts" near you.

**Step 6 — Add geolocation**

```bash
npm install @capacitor/geolocation
```

```typescript
import { Geolocation } from '@capacitor/geolocation';

const position = await Geolocation.getCurrentPosition();
// Use position.coords.latitude/longitude to filter nearby restaurants
```

**Step 7 — Open in Xcode and Android Studio**

```bash
npx cap open ios      # opens Xcode — requires a Mac
npx cap open android  # opens Android Studio
```

Set your bundle ID (`net.eatsharelove.app`), signing certificates, and app icons.

**Step 8 — App Store submission**

- Apple Developer Program: $99/year — required for iOS App Store
- Google Play Developer: $25 one-time — required for Android Play Store
- App Store review: 1–3 days (Apple), a few hours to 1 day (Google)

#### App Store Review Risks

These reject Capacitor apps routinely and none of them are quick fixes at submission time — plan for them up front:

- **Guideline 4.2 (minimum functionality):** thin web wrappers get rejected. Push notifications, the native camera plugin, and native-feeling navigation are what justify the app's existence to a reviewer — ship them in the first submission, not as follow-ups.
- **Sign in with Apple** is required if the app offers any third-party login (e.g., Google OAuth).
- **In-app account deletion** (Guideline 5.1.1(v)) is mandatory. The GDPR cascade delete needs a user-facing button before submission.
- **Creator Pro vs. Apple IAP:** a $9/mo consumer subscription purchasable inside the iOS app must go through In-App Purchase, where Apple takes 15–30%. Either sell Creator Pro on the web only, or price the iOS version to absorb the cut. Restaurant subscriptions are unaffected — they're B2B services billed through the web dashboard, where Stripe is fine.

---

## Tech Stack Changes Required

| Addition | Package / Service | Purpose |
|---|---|---|
| Capacitor core | `@capacitor/core`, `@capacitor/cli` | Mobile wrapper |
| Capacitor iOS | `@capacitor/ios` | App Store build |
| Capacitor Android | `@capacitor/android` | Play Store build |
| Capacitor Camera | `@capacitor/camera` | Native photo picker |
| Capacitor Push | `@capacitor/push-notifications` | Re-engagement |
| Capacitor Geo | `@capacitor/geolocation` | Restaurant discovery |
| Firebase FCM | Firebase Cloud Messaging | Push notification delivery |
| Stripe | `stripe`, `@stripe/stripe-js` | Restaurant subscription billing |
| Stripe webhook handler | Appwrite Function | Sole writer of billing state — see note below the collections table |
| Resend or SendGrid | API | Verification workflow emails, receipts |
| Appwrite Cloud Pro | $25/mo | Likely needed at Stripe integration (Functions + limits) — well before the 50K-user Supabase trigger |

**New Appwrite collections needed:**

| Collection | Fields |
|---|---|
| `businesses` | name, address, phone, website, owner_user_id, verified, tier, stripe_customer_id |
| `dietary_tags` | name, slug, category (restriction/preference/religious) |
| `verifications` | business_id, status, submitted_at, reviewed_at, reviewer_notes |
| `ad_placements` | advertiser_id, type, dietary_tags, start_date, end_date, budget |
| `affiliate_links` | post_id, product_name, url, clicks, conversions |

**Billing state is server-write-only.** `businesses.verified`, `businesses.tier`, and `businesses.stripe_customer_id` must be writable only by the Stripe webhook Appwrite Function using a server API key — never by client code. Everything in `src/lib/appwrite/api.ts` runs in the browser, so any client-side check on billing state can be bypassed from the DevTools console. Set Appwrite document permissions so users can read these fields but never write them.

---

## Build Priority Order — Trigger-Gated Milestones

The original calendar phases ("weeks 1–6", "weeks 7–12") assumed full-time dedicated capacity and were obsolete within weeks of writing. Each milestone below is gated on a trigger, not a date. Build nothing until its gate opens — "sell before building" applies to every B2B feature. The consumer wedge comes first because every revenue stream depends on an audience, and the smallest row in the revenue table already assumes 10,000 users.

### Milestone 1 — Consumer wedge (start now, no gate)

1. **Standardized dietary tag system + backfill** — canonical `dietary_tags` collection (Gluten-Free, Vegan, Nut-Free, Kosher, Halal, Keto, Dairy-Free, etc.) attached to both posts and, later, restaurant listings. Posts currently store free-text comma-split tags, so this is a data migration, not just a feature: every existing post's tags must be mapped to canonical tags. Budget the backfill as its own task.
2. **Dietary-filtered search** — filter Explore by one or more canonical tags. This is the consumer feature that differentiates Eatable from Instagram, generates the tag data every other revenue stream depends on, and doubles as the sales demo for restaurant outreach.
3. **PWA** — manifest + service worker (see Mobile Plan, Phase A). Installable app on Android and iOS 16.4+ at near-zero cost.

### Milestone 2 — Validate restaurant demand (no code)

4. **Restaurant outreach** — 10 structured conversations with local restaurants, demoing filtered search. Target: 3 verbal commitments at a real price. If nobody commits at $29/mo, that finding arrives now instead of after months of building.
5. **Verification liability groundwork** — ToS/disclaimer language, re-verification cadence, incident-report design, insurance quote (see Verification Operations & Liability). Required before the first badge ships.

**Gate: 3 restaurants verbally committed → Milestone 3.**

### Milestone 3 — Verification product

6. **Business/restaurant profile system** — separate from user accounts; owner can claim and manage their listing
7. **Verification application workflow** — form for restaurant owners, admin review queue
8. **Admin dashboard** — internal tool to process applications and manage listings; verified restaurants surface first in filtered search
9. **Manual billing** — invoice the first restaurants with Stripe payment links (zero code)

**Gate: ~5 restaurants paying → Milestone 4.**

### Milestone 4 — Billing automation

10. **Stripe subscription integration** — checkout + customer portal, on the web dashboard only
11. **Stripe webhook Appwrite Function** — the sole writer of `tier` / `verified` / `stripe_customer_id` (see Billing state is server-write-only)

**Gate: consumer traction worth a store presence (steady weekly signups/retention) → Milestone 5.**

### Milestone 5 — Mobile app

12. **Capacitor spike** — 1–2 days verifying Appwrite sessions/CORS inside the WebView before trusting the integration estimate
13. **Capacitor integration** — wrap existing app, native camera, FCM push, geolocation (see Mobile Plan, Phase B)
14. **App Store and Play Store submission** — with the App Store Review Risks list addressed up front

**Gate: an audience worth selling to advertisers → Milestone 6.**

### Milestone 6 — Ads and affiliate

15. **Manual brand deals first** — direct outreach, flat monthly fees, no ad tech (this was already the plan in Revenue Stream 2; it gates the rest)
16. **Sponsored post infrastructure + "Shop this post" affiliate tagging** — build after the first flat-fee deal closes
17. **Brand partner dashboard** — build after 3+ active brand deals exist to use it

---

## BaaS: Stay on Appwrite, Plan to Migrate

**Now through ~50K users:** Stay on Appwrite. Free tier covers 75K MAU. No migration cost justified at this stage.

**At ~50K users, migrate to Supabase:**

- Feed ranking and dietary filtering queries are 10–50x faster in PostgreSQL (single SQL query vs. multiple API roundtrips with client-side merging)
- PostgreSQL RLS enforces ownership at the database layer — eliminates the authorization vulnerabilities documented in the security audit
- Supabase is 50–70% cheaper than Firebase at growth stage
- PostGIS extension enables native geolocation queries for restaurant discovery
- Standard PostgreSQL means no vendor lock-in — the data is exportable anytime

**Migration timeline:** ~2–3 weeks of focused work. Auth, database schema, and queries all need updating. Storage (images) stays on Cloudinary — no change needed there.

---

## Competitive Moat

**Yelp** is restaurant-first. Users search for a restaurant, then try to filter by dietary tag. The tags are user-submitted, unverified, and inconsistent.

**Instagram/TikTok** have food content but no dietary intent layer. A user can hashtag `#glutenfree` but there's no system that connects that content to a trusted restaurant or product.

**Eatable** is restriction-first. The user starts with their restriction — the platform surfaces restaurants, posts, and products that are verified to meet it. The community forms around shared need, and that need is non-negotiable (health, religion, ethics). That creates stronger retention and stronger trust than general food content.

Large platforms can add dietary filters. They cannot add community trust. The verification product and the community credibility behind it are the moat.
