// Cart state (localStorage) for the Quadstar demo shop.
// Every change is broadcast as a DOM event; the Data Cloud sitemap turns them into Web SDK events:
//   quadstar:cart     detail = { action: "add" | "remove", lineItem } | { action: "replace", lineItems }
//   quadstar:purchase detail = { order: { id, totalValue, currency, lineItems } }
(function () {
  const KEY = "quadstar.cart";
  const ORDER_KEY = "quadstar.lastOrder";
  const CURRENCY = "USD";

  const products = window.QUADSTAR_PRODUCTS || [];
  const byId = (id) => products.find((p) => p.id === String(id));

  const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");
  const save = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadge();
  };

  function lineItem(id, quantity) {
    const p = byId(id);
    return {
      catalogObjectType: "Product",
      catalogObjectId: String(id),
      quantity: quantity,
      price: p ? p.price : 0,
      currency: CURRENCY,
    };
  }

  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const lineItems = () => load().map((i) => lineItem(i.id, i.qty));

  function updateBadge() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const n = load().reduce((s, i) => s + i.qty, 0);
    el.textContent = n;
    el.style.visibility = n ? "visible" : "hidden";
  }

  window.QuadstarCart = {
    currency: CURRENCY,
    product: byId,
    items: () => load().map((i) => ({ product: byId(i.id), qty: i.qty })).filter((i) => i.product),
    count: () => load().reduce((s, i) => s + i.qty, 0),
    total: () => load().reduce((s, i) => s + (byId(i.id)?.price || 0) * i.qty, 0),

    add(id, qty = 1) {
      id = String(id);
      const items = load();
      const item = items.find((i) => i.id === id);
      if (item) item.qty += qty;
      else items.push({ id, qty });
      save(items);
      emit("quadstar:cart", { action: "add", lineItem: lineItem(id, qty) });
    },

    remove(id) {
      id = String(id);
      const items = load();
      const item = items.find((i) => i.id === id);
      if (!item) return;
      save(items.filter((i) => i.id !== id));
      emit("quadstar:cart", { action: "remove", lineItem: lineItem(id, item.qty) });
    },

    setQty(id, qty) {
      id = String(id);
      if (qty < 1) return this.remove(id);
      const items = load();
      const item = items.find((i) => i.id === id);
      if (!item || item.qty === qty) return;
      item.qty = qty;
      save(items);
      emit("quadstar:cart", { action: "replace", lineItems: lineItems() });
    },

    checkout(customer) {
      const order = {
        id: "WEB-" + Date.now().toString(36).toUpperCase(),
        totalValue: Math.round(this.total() * 100) / 100,
        currency: CURRENCY,
        lineItems: lineItems(),
      };
      localStorage.setItem(ORDER_KEY, JSON.stringify({ ...order, customer, date: new Date().toISOString() }));
      emit("quadstar:purchase", { order });
      save([]);
      return order;
    },

    lastOrder: () => JSON.parse(localStorage.getItem(ORDER_KEY) || "null"),
  };

  updateBadge();
})();
