# Embraix Store — Product Ingestion + Voice Transcription Fix

Two related upgrades:
1. A controlled scraper-based product ingestion pipeline with admin review.
2. A fix for the broken AI voice transcription.

---

## 1. Voice transcription fix (root cause)

Current `voice-to-text` edge function calls `https://ai.gateway.lovable.dev/v1/audio/transcriptions` with `model: whisper-1`. The Lovable AI Gateway does **not** expose Whisper / `audio/transcriptions` — that endpoint silently 404s/500s, which matches the symptom (no working transcription, no logs because the request fails before invoke handler logs flush, or the gateway returns a non-2xx that surfaces as "Transcription service unavailable").

### Fix
Rewrite `supabase/functions/voice-to-text/index.ts` to use **Gemini 2.5 Flash multimodal** via the Lovable AI Gateway chat completions endpoint (already used elsewhere in the project for `ai-chat`), passing the audio as inline base64 data with mime `audio/webm` and instructing the model to return only the transcript.

- Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Model: `google/gemini-2.5-flash`
- Message content: `[{ type: "text", text: "Transcribe this audio. Return only the spoken text, no commentary." }, { type: "input_audio", input_audio: { data: <base64>, format: "webm" } }]`
- Keep existing JWT validation, rate-limit (20/hr), and CORS handling.
- Handle 429 (rate limit) and 402 (credits) gracefully and return clear error messages.

No client changes needed — `VoiceInput.tsx` already POSTs base64 + reads `data.text`.

---

## 2. Store product ingestion system

### 2a. Database migration (`store_products`)
Add columns:
- `status` text default `'draft'` — values: `draft | approved | published | rejected`
- `source` text nullable — e.g. `manufacturer_name`, `manual`
- `source_url` text nullable
- `model` text nullable
- `manufacturer_price` numeric nullable — raw scraped price
- `markup_percent` numeric default `12`
- `tags` text[] default `'{}'`
- `short_description` text nullable
- `specifications` already exists (jsonb) — reuse
- Index on `(brand, model, name)` for duplicate detection.

Update RLS:
- "Anyone can view active products" → also require `status = 'published'`.
- Admin policies unchanged (full access).

Backfill existing rows: `status = 'published'`, `source = 'manual'`.

### 2b. Edge function: `scrape-product`
New function `supabase/functions/scrape-product/index.ts`:
- Auth: JWT + admin role check.
- Input: `{ urls: string[] }` (1–20).
- For each URL:
  1. Fetch page HTML (or use Firecrawl if connector available; otherwise plain fetch + readability).
  2. Pass HTML + URL to Gemini 2.5 Flash via Lovable AI gateway with a structured-output prompt requesting JSON: `{ name, brand, model, description, short_description, price, currency, images[], specifications{}, category, tags[] }`.
  3. Clean HTML artifacts, normalize whitespace, dedupe text.
  4. Duplicate check: query `store_products` for matching `(brand, model)` or fuzzy `name` (ILIKE 40-char prefix). If match → skip with `status: "duplicate"` in response.
  5. Compute `final_price = manufacturer_price * (1 + markup_percent/100)`.
  6. Insert with `status = 'draft'`, `source = host of URL`, `source_url = url`, `is_active = false`.
- Returns per-URL result `{ url, status: "saved"|"duplicate"|"failed", productId?, error? }`.

### 2c. Admin UI updates (`StoreProductsManager.tsx`)
- Add **Scraper panel** (collapsible card at top): textarea for URLs (one per line) + "Scrape" button. Shows live progress list (success/duplicate/failed per URL) using a Progress bar + result table.
- Add **status filter tabs**: `All | Draft | Approved | Published | Rejected` with counts.
- Replace single `is_active` toggle row with a status badge and action buttons:
  - Draft → "Approve" / "Reject" / "Edit" / "Delete"
  - Approved → "Publish" / "Edit" / "Delete"
  - Published → "Unpublish" / "Edit" / "Delete"
- Add **markup field** in edit dialog (default 12%) with live preview of final price; admin can override `price` directly.
- Add **tags** input (comma-separated).
- Add **short_description** textarea.
- Stats header: Total / Draft / Approved / Published cards.

### 2d. Public store updates
- `useStoreProducts` filter additionally requires `status = 'published'` (server-side via the new RLS).
- `StoreProductCard` lazy-loads images (`loading="lazy"`) — verify already in place; add if missing.
- Product detail page: ensure gallery, specs table, warranty, installation section render from existing fields (already supported, minor polish only).

### 2e. AI ↔ Store integration
- `ai-chat` edge function already references products. Update its product fetch to filter `status = 'published'` and prefer products with `images.length > 0` and `tags` matching user intent keywords.

---

## 3. Technical notes

- Categories in DB enum currently: `solar_panels, batteries, inverters, ev_chargers, smart_devices, accessories, bundles`. The user-requested taxonomy (Solar Solutions, Clean Cooking, EV, Smart Tech, Energy Accessories, Bundles & Packages) maps onto these except **Clean Cooking** — add `clean_cooking` to the `store_product_category` enum in the migration.
- Firecrawl: if no connection is linked, fall back to `fetch(url)` with a desktop User-Agent and rely on Gemini to parse HTML. We will not auto-prompt the user to connect Firecrawl unless they want higher reliability.
- All scraped products are inserted with `is_active=false` and `status='draft'`; admin must explicitly publish.

## 4. Files to create / edit

Edit:
- `supabase/functions/voice-to-text/index.ts` (rewrite to Gemini)
- `supabase/functions/ai-chat/index.ts` (filter by status)
- `src/components/admin/StoreProductsManager.tsx` (status workflow, scraper panel, markup, tags)
- `src/hooks/useStoreProducts.tsx` (status filter)
- `src/components/store/StoreProductCard.tsx` (lazy images, optional)

Create:
- `supabase/functions/scrape-product/index.ts`
- `src/components/admin/ProductScraperPanel.tsx`
- New migration: add columns to `store_products`, extend enum with `clean_cooking`, update RLS.

## 5. Out of scope
- Connecting Firecrawl (optional future improvement).
- Order/checkout flow.
