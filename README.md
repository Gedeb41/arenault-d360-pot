# Quadstar — demo shop for the Data Cloud Web SDK

Static site (GitHub Pages: https://gedeb41.github.io/arenault-d360-pot/) instrumented with the
Data Cloud Interactions Web SDK, connected to the `RealTimeWeb` Website connector of the
`data360-demo` org. No orders are processed: cart and orders live in `localStorage`.

## Pages

| Page | `body[data-page]` | Content |
|---|---|---|
| `index.html` | `home` | Hero (`div#hero-image` = personalization content zone), tiles, best sellers |
| `devices.html` | `devices` | Catalogue, filters `?type=Phone\|Tablet\|Accessories`, brand, sort |
| `product.html?id=<ID__c>` | `product` | Product detail, colour / storage / quantity, Add to cart, related products |
| `cart.html` | `cart` | Cart lines, quantities, removal |
| `checkout.html` | `checkout` | Form prefilled from the logged-in user, no payment collected |
| `confirmation.html` | `confirmation` | Last order |
| `product1-3.html` | — | Legacy URLs, redirect to `product.html?id=1/3/2` |

## Scripts

Load order at the end of each page: `data/products.js`, `scripts/layout.js`, `scripts/cart.js`, `scripts/shop.js`.
The SDK beacon (`cdn.c360a.salesforce.com/beacon/c360a/<sourceId>/scripts/c360a.min.js`) is in `<head>`.

- `data/products.js` — catalogue generated from `Product__dlm` (do not edit by hand).
- `scripts/layout.js` — shared header / footer, login and register forms, remembers the user (`quadstar.user`).
- `scripts/cart.js` — `window.QuadstarCart` (`quadstar.cart`, `quadstar.lastOrder`); broadcasts DOM events.
- `scripts/shop.js` — page renderers; product pages set `<main data-product-id data-product-price>`.
- `scripts/sitemap.js` — working copy of the sitemap **hosted in the connector** (not included by the pages).

## Web SDK events

The site never calls the SDK directly; `cart.js` dispatches DOM events and the sitemap maps them:

| DOM event | `detail` | SDK interaction |
|---|---|---|
| `quadstar:cart` | `{action: "add", lineItem}` | `Add To Cart` |
| `quadstar:cart` | `{action: "remove", lineItem}` | `Remove From Cart` |
| `quadstar:cart` | `{action: "replace", lineItems}` | `Replace Cart` (quantity change) |
| `quadstar:purchase` | `{order: {id, totalValue, currency, lineItems}}` | `Purchase` |

Line items: `{catalogObjectType: "Product", catalogObjectId: <Product__dlm.ID__c>, quantity, price, currency: "USD"}`.
Product pages also send `View Catalog Object` (id read from `[data-product-id]`); other pages send a page view.

Known gap: the connector's behavioral stream has no `orderItem` fields, so Purchase line items are not
ingested until `orderItem` is added to the data stream in the UI.

## Update the catalogue

```bash
python3 tools/export_products.py --org data360-demo
```

Queries `Product__dlm` through `/ssot/queryv2` (sf CLI), maps images (exact visuals for flagship IDs,
deterministic pools by brand and type otherwise) and rewrites `data/products.js`. Accessories get SVG
illustrations drawn by `tools/accessory_images.py`, one per kind and colour (`images/accessories/`); their
`images` map lets the product page swap the visual with the colour picker.

## Publish the sitemap

The effective sitemap is the one stored in the connector and embedded in the beacon. After editing
`scripts/sitemap.js`, back up the current one (GET) then replace it:

```
GET /services/data/v62.0/ssot/connections/1WMWt00000063RROAY/sitemap
PUT /services/data/v62.0/ssot/connections/1WMWt00000063RROAY/sitemap   body {"sitemap": "<raw js>"}
```

The PUT is a full replacement; the GET returns the JS HTML-encoded. The CDN serves the new beacon within ~120 s.

## Run locally

Any static server, e.g. `python3 -m http.server 8765`. Events go to the real org (the beacon is the hosted one).
