// The ONE place that decides which API operations the public reference documents.
//
// apps/api/openapi.json carries no security schemes and no tags: every route the API serves is
// in it, including the 2pay staff console (/v1/admin/*) and the merchant panel's session-only
// routes. So the reference works from an explicit ALLOW list (GROUPS below) and an explicit DENY
// list (DENY_RULES). An operation in the spec that matches neither is reported by the generator
// as "unclassified" so a new route is never published, or forgotten, by accident.
//
// Auth kinds, as enforced in apps/api/src/http/auth.ts and the route files:
//   api_key       Authorization: Bearer sk_live_... / sk_test_..., plus the scope named per op
//   server_token  X-2Pay-Server-Token: the per-game-server token (Game API)
//   basket_token  X-Basket-Token: the token returned when the basket was created
//   public        no credential (storefront reads)

/** @typedef {"api_key" | "server_token" | "basket_token" | "public"} AuthKind */
/**
 * @typedef {object} CatalogOp
 * @property {string} op       "METHOD /path" exactly as in openapi.json
 * @property {string} summary  heading shown in the reference
 * @property {AuthKind} auth
 * @property {string} [scope]  required api-key scope
 * @property {boolean} [idempotent] accepts an Idempotency-Key header
 * @property {string} [note]   one extra sentence of behaviour worth knowing
 */
/**
 * @typedef {object} CatalogGroup
 * @property {string} slug     page file name under content/dev/reference
 * @property {string} title
 * @property {string} section  sidebar section
 * @property {string} description
 * @property {string} [host]   base URL when it is not https://api.2pay.gg
 * @property {CatalogOp[]} ops
 */

export const API_HOST = "https://api.2pay.gg";
export const GAME_HOST = "https://game.2pay.gg";

/** Operations that are never documented here. Matched against the spec path. */
export const DENY_RULES = [
  { pattern: /^\/v1\/admin(\/|$)/, reason: "2pay staff console" },
  { pattern: /^\/v1\/auth\//, reason: "merchant panel sign-in (session)" },
  { pattern: /^\/v1\/me(\/|$)/, reason: "merchant panel profile (session)" },
  { pattern: /^\/v1\/stores\/\{storeId\}/, reason: "merchant panel store routes (session)" },
  { pattern: /^\/v1\/accounts\//, reason: "merchant panel account routes (session)" },
  { pattern: /^\/v1\/webhooks\/\{provider\}$/, reason: "inbound payment provider webhooks" },
  { pattern: /^\/v1\/stripe\/webhooks$/, reason: "inbound payment provider webhooks" },
  { pattern: /^\/(healthz|readyz)$/, reason: "infrastructure health checks" },
];

/** @type {CatalogGroup[]} */
export const GROUPS = [
  {
    slug: "catalog",
    title: "Products and categories",
    section: "Developer API",
    description: "Read the products and categories of the store your API key belongs to.",
    ops: [
      { op: "GET /v1/products", summary: "List products", auth: "api_key", scope: "products:read" },
      { op: "GET /v1/products/{id}", summary: "Retrieve a product", auth: "api_key", scope: "products:read" },
      { op: "GET /v1/categories", summary: "List categories", auth: "api_key", scope: "products:read" },
      { op: "GET /v1/categories/{id}", summary: "Retrieve a category", auth: "api_key", scope: "products:read" },
    ],
  },
  {
    slug: "checkouts",
    title: "Checkouts",
    section: "Developer API",
    description: "Create a hosted checkout session for one or more products.",
    ops: [
      {
        op: "POST /v1/checkouts",
        summary: "Create a checkout",
        auth: "api_key",
        scope: "checkouts:write",
        idempotent: true,
        note: "A test-mode key creates a test-mode checkout, paid through the store's separate test payment credentials.",
      },
    ],
  },
  {
    slug: "orders",
    title: "Orders",
    section: "Developer API",
    description: "List and retrieve the orders placed in your store.",
    ops: [
      { op: "GET /v1/orders", summary: "List orders", auth: "api_key", scope: "orders:read" },
      { op: "GET /v1/orders/{id}", summary: "Retrieve an order", auth: "api_key", scope: "orders:read" },
    ],
  },
  {
    slug: "refunds",
    title: "Refunds",
    section: "Developer API",
    description: "Refund a paid order and follow the refund's status.",
    ops: [
      {
        op: "POST /v1/refunds",
        summary: "Create a refund",
        auth: "api_key",
        scope: "refunds:write",
        idempotent: true,
        note: "Refunds the order in full. Partial refunds can only be issued by 2Pay staff.",
      },
      { op: "GET /v1/refunds", summary: "List refunds", auth: "api_key", scope: "refunds:read" },
      { op: "GET /v1/refunds/{id}", summary: "Retrieve a refund", auth: "api_key", scope: "refunds:read" },
    ],
  },
  {
    slug: "disputes",
    title: "Disputes",
    section: "Developer API",
    description: "Read chargebacks raised against your orders.",
    ops: [
      { op: "GET /v1/disputes", summary: "List disputes", auth: "api_key", scope: "disputes:read" },
      { op: "GET /v1/disputes/{id}", summary: "Retrieve a dispute", auth: "api_key", scope: "disputes:read" },
    ],
  },
  {
    slug: "balance-and-payouts",
    title: "Balance and payouts",
    section: "Developer API",
    description: "Read your balance and ledger, and request payouts to your bank account.",
    ops: [
      { op: "GET /v1/balance", summary: "Retrieve the balance", auth: "api_key", scope: "ledger:read" },
      { op: "GET /v1/ledger_entries", summary: "List ledger entries", auth: "api_key", scope: "ledger:read" },
      {
        op: "POST /v1/payouts",
        summary: "Create a payout",
        auth: "api_key",
        scope: "payouts:write",
        idempotent: true,
        note: "The account must have passed verification and have a payout destination on file.",
      },
      { op: "GET /v1/payouts", summary: "List payouts", auth: "api_key", scope: "payouts:read" },
      { op: "GET /v1/payouts/{id}", summary: "Retrieve a payout", auth: "api_key", scope: "payouts:read" },
    ],
  },
  {
    slug: "deliveries",
    title: "Deliveries",
    section: "Developer API",
    description: "Read the fulfilment tasks created for paid orders and report their outcome.",
    ops: [
      { op: "GET /v1/deliveries", summary: "List deliveries", auth: "api_key", scope: "deliveries:read" },
      { op: "GET /v1/deliveries/{id}", summary: "Retrieve a delivery", auth: "api_key", scope: "deliveries:read" },
      { op: "POST /v1/deliveries/{id}/complete", summary: "Complete a delivery", auth: "api_key", scope: "deliveries:write" },
      { op: "POST /v1/deliveries/{id}/fail", summary: "Fail a delivery", auth: "api_key", scope: "deliveries:write" },
    ],
  },
  {
    slug: "webhook-endpoints",
    title: "Webhook endpoints and events",
    section: "Developer API",
    description: "Register the URLs 2Pay sends events to, send a test event, and read past events.",
    ops: [
      {
        op: "POST /v1/webhook_endpoints",
        summary: "Create a webhook endpoint",
        auth: "api_key",
        scope: "webhooks:write",
        idempotent: true,
        note: "The signing secret is returned once, in this response only.",
      },
      { op: "GET /v1/webhook_endpoints", summary: "List webhook endpoints", auth: "api_key", scope: "webhooks:read" },
      { op: "GET /v1/webhook_endpoints/{id}", summary: "Retrieve a webhook endpoint", auth: "api_key", scope: "webhooks:read" },
      { op: "DELETE /v1/webhook_endpoints/{id}", summary: "Delete a webhook endpoint", auth: "api_key", scope: "webhooks:write" },
      { op: "POST /v1/webhook_endpoints/{id}/test", summary: "Send a test event", auth: "api_key", scope: "webhooks:write" },
      { op: "GET /v1/events", summary: "List events", auth: "api_key", scope: "events:read" },
      { op: "GET /v1/events/{id}", summary: "Retrieve an event", auth: "api_key", scope: "events:read" },
    ],
  },
  {
    slug: "storefront",
    title: "Storefront",
    section: "Storefront API",
    description: "Public, read-only view of a live store: its settings, categories and products.",
    ops: [
      { op: "GET /v1/storefront/{slug}", summary: "Retrieve a storefront", auth: "public" },
      { op: "GET /v1/storefront/{slug}/categories", summary: "List storefront categories", auth: "public" },
      { op: "GET /v1/storefront/{slug}/products", summary: "List storefront products", auth: "public" },
      { op: "GET /v1/storefront/{slug}/products/{productId}", summary: "Retrieve a storefront product", auth: "public" },
      {
        op: "GET /v1/storefront/{slug}/orders/by-session/{sessionId}",
        summary: "Retrieve an order by checkout session",
        auth: "public",
        note: "Used by the order confirmation page after the buyer returns from checkout.",
      },
      {
        op: "GET /v1/storefront/{slug}/subscriptions/by-session/{sessionId}",
        summary: "Retrieve a subscription by checkout session",
        auth: "public",
      },
    ],
  },
  {
    slug: "baskets",
    title: "Baskets",
    section: "Storefront API",
    description: "Build a basket, apply a coupon or gift card, and turn it into a hosted checkout.",
    ops: [
      {
        op: "POST /v1/storefront/{slug}/baskets",
        summary: "Create a basket",
        auth: "public",
        note: "The response carries the basket token. Send it as X-Basket-Token on every later call for this basket.",
      },
      { op: "GET /v1/storefront/{slug}/baskets/{basketId}", summary: "Retrieve a basket", auth: "basket_token" },
      { op: "POST /v1/storefront/{slug}/baskets/{basketId}/items", summary: "Add an item", auth: "basket_token" },
      { op: "DELETE /v1/storefront/{slug}/baskets/{basketId}/items/{itemId}", summary: "Remove an item", auth: "basket_token" },
      { op: "POST /v1/storefront/{slug}/baskets/{basketId}/coupon", summary: "Apply a coupon", auth: "basket_token" },
      { op: "DELETE /v1/storefront/{slug}/baskets/{basketId}/coupon", summary: "Remove the coupon", auth: "basket_token" },
      { op: "POST /v1/storefront/{slug}/baskets/{basketId}/gift-card", summary: "Apply a gift card", auth: "basket_token" },
      { op: "DELETE /v1/storefront/{slug}/baskets/{basketId}/gift-card", summary: "Remove the gift card", auth: "basket_token" },
      { op: "POST /v1/storefront/{slug}/baskets/{basketId}/checkout", summary: "Check out a basket", auth: "basket_token" },
      { op: "POST /v1/storefront/{slug}/subscribe", summary: "Start a subscription checkout", auth: "public" },
    ],
  },
  {
    slug: "game-api",
    title: "Game API",
    section: "Game API",
    description: "The delivery queue a game server plugin polls, authenticated by a per-server token.",
    host: GAME_HOST,
    ops: [
      { op: "GET /v1/queue", summary: "Poll the queue", auth: "server_token" },
      { op: "GET /v1/queue/online-commands/{playerId}", summary: "List online commands for a player", auth: "server_token" },
      { op: "GET /v1/queue/offline-commands", summary: "List offline commands", auth: "server_token" },
      {
        op: "DELETE /v1/queue",
        summary: "Confirm executed commands",
        auth: "server_token",
        note: "Confirming is idempotent: confirming a command twice is harmless.",
      },
      { op: "GET /v1/information", summary: "Retrieve server information", auth: "server_token" },
    ],
  },
];
