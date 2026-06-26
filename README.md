# Fit AI Brand — Nova Cruz

**AI fitness influencer → POD gym clothing brand.** Fully automated content, email marketing, social media management, and ecommerce store.

**Startup cost: <$500. Monthly ops: $80-160. Revenue potential: $12K+/month by month 6. Year 1 net: $80K+. Year 2 net: $300K+.**

---

## Quick Start

```bash
cd fit-ai-brand
cp .env.template .env
pip install requests python-dotenv    # Python bots
cd store && npm install               # Node.js store

# Generate a week of Nova's content
python bots/content_bot.py --batch 7 --dry-run

# Start the store
cd store && npm start
```

---

## Project Structure

```
fit-ai-brand/
├── README.md
├── .env.template
│
├── bots/                           ← 3 automation engines
│   ├── content_bot.py              ← AI influencer images + captions
│   ├── product_bot.py              ← Printify product creator (Shop 27652520)
│   └── email_bot.py                ← Welcome, abandoned cart, promo emails
│
├── store/                          ← Custom Node.js ecommerce
│   ├── server.js                   ← Express server
│   ├── lib/printify.js             ← Printify API client
│   ├── lib/suppliers.js            ← Multi-supplier abstraction
│   ├── views/                      ← 8 EJS templates
│   └── package.json
│
├── docs/
│   ├── 01-nova-cruz-brand-book.md   ← Persona, voice, visual identity
│   ├── 02-business-plan.md          ← Strategy, timeline, metrics
│   ├── 03-financial-model.md        ← Revenue projections ($168K Y1)
│   └── 04-content-calendar.md       ← 90-day post schedule + email sequences
│
└── research/
    └── 01-research-report.md        ← 12 cited sources proving viability
```

---

## The 3 Bots

| Bot | Command | Does |
|---|---|---|
| `content_bot.py` | `python bots/content_bot.py --batch 7` | Generates Nova's images + captions for a week |
| `product_bot.py` | `python bots/product_bot.py --batch the-basics` | Creates Printify products via API |
| `email_bot.py` | `python bots/email_bot.py --welcome user@email.com` | Welcome, abandoned cart, new drop emails |

---

## The Store

Custom Node.js + Express + EJS. No Shopify fees. Full control.

| Feature | Route |
|---|---|
| Homepage | `/` |
| All products (synced from Printify) | `/products` |
| Product detail | `/products/:id` |
| Cart | `/cart` |
| Stripe checkout | `/checkout` |
| Order confirmed | `/order-confirmed` |
| Admin dashboard | `/admin` |
| Health check | `/health` |

**Deploy:** `cd store && railway up`

---

## The Content Flywheel

```
Daily Nova posts (3/day across IG + TikTok + Pinterest)
        ↓
Followers grow (organic + viral)
        ↓
Followers buy Nova Cruz gym wear (Printify POD → auto-fulfilled)
        ↓
Email sequences nurture customers (welcome → repeat → upsell)
        ↓
Revenue funds more content + paid ads
        ↓
Larger audience → more sales → brand deals
```

---

## Evidence This Works (12 Cited Sources)

| Source | Finding |
|---|---|
| Aitana Lopez (@fit_aitana) | 380K followers, $10K+/month, AI fitness influencer |
| MakeInfluencer.ai | AI influencers earn $2K-10K/month in 4-6 months |
| Reddit r/passive_income | AI influencer made $3.8K from 700 followers |
| wayin.ai | Virtual influencers get 3x more engagement |
| Printify | 60+ gym clothing POD items, 50-58% margins |
| Gymshark | $1B+ brand built on influencer marketing |
| SellersCommerce | Dropshipping market: $543B (2026) |

---

## Required API Keys

| Key | For |
|---|---|
| `FAL_KEY` | AI influencer images (fal.ai) |
| `PRINTIFY_API_KEY` | Product sync + order fulfillment |
| `ANTHROPIC_API_KEY` | AI captions (optional — built-in fallbacks) |
| `STRIPE_SECRET_KEY` + `STRIPE_PUBLIC_KEY` | Store payments |
| `SMTP_USER` + `SMTP_PASS` | Email marketing |

---

## Product Collections

| Collection | Products | Price Range | Launch |
|---|---|---|---|
| The Basics | Hoodie, Tee, Tank, Leggings | $29.99-64.99 | Week 1 |
| Nova Signature | Crop, Sports Bra, Joggers, Shorts | $34.99-59.99 | Month 3 |
| Seasonal Drop | Rotating limited editions | $34.99-74.99 | Quarterly |

---

## 90-Day Launch Summary

| Phase | Weeks | Focus | Goal |
|---|---|---|---|
| Pre-Launch | 1-4 | Build content library, engage community | 1K followers |
| Launch | 5 | Product launch, email blast, promo | First 15 orders |
| Momentum | 6-8 | Scale posting, micro-influencer outreach | 5K followers |
| Scale | 9-12 | Paid ads, Collection 2, brand deals | 15K followers, $3K/mo |
