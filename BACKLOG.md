# Backlog — Quadstar demo shop

## Data stream: ingest Purchase line items

The `RealTimeWeb` behavioral stream has no `orderItem` fields (schema: orderItem "Available", not "In Use"),
so Purchase events arrive without their products. Add `orderItem` to the data stream in the UI.

## 3. Hero personalization and recommendations (detailed 2026-10-20, not started)

Org state on 2026-10-20: no PersonalizationPoint / Decision / Recommender / Schema records; the user lacks the
`PersonalizationAdmin` permission set (required by the v66 API, otherwise NOT_FOUND). The site already declares
`div#hero-image` as a content zone in the sitemap.

1. **Prerequisites** — assign `PersonalizationAdmin` (config change: get approval first); check that
   `RealTime_Profile_DG` carries the web events (real-time targeting).
2. **Point `Homepage_Hero`** on `#hero-image`, decision with variants:

   | Visitor | Hero |
   |---|---|
   | Anonymous / default | Current hero (ePhone 14 Edge), also the fallback |
   | Viewed tablets in the session | ePad 5 Pro |
   | Known customer, high `Predicted_Churn` | Loyalty offer |
   | Already bought a phone | Accessories cross-sell |

3. **"Recommended for you"** on home and product pages: recommender on `Product__dlm` (item data graph +
   schema via v66 API), replacing the static best sellers / related products. Web events already use
   `catalogObjectId` = `Product__dlm.ID__c`.
4. **Front** — sitemap calls `SalesforceInteractions.Personalization.fetch([...])` on home / product pages and
   renders into the hero and blocks; static content stays as fallback. Republish the sitemap (PUT).
5. **Demo script** — anonymous, view two tablets, back to home: hero switches to ePad; log in as a high-churn
   profile: loyalty offer and profile-based recommendations.

Open points: Personalization Points are probably UI-only (aura), so points and decisions are configured in the
UI with a step-by-step guide; the real-time path has 1-3 min latency and is hard to get working end to end on
an SDO, so plan a segment-based rule as a fallback.

## 4. "My account" space — to detail

Profile and order history for the logged-in user.

## 5. Support and reviews — to detail

Contact / support form and product reviews.

## 6. Finishing touches — to detail
