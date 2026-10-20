// Page rendering for the shop pages, driven by <body data-page="...">.
(function () {
  const products = window.QUADSTAR_PRODUCTS || [];
  const cart = window.QuadstarCart;
  const params = new URLSearchParams(window.location.search);

  const COLORS = {
    Black: "#323232", Grey: "#9AA0A6", White: "#F4F4F4", Blue: "#314780", Green: "#2E7D4F",
    Pink: "#F2A7C3", Purple: "#6A3FA0", Red: "#C91524", Yellow: "#F2C230",
  };
  const TYPE_LABEL = { Phone: "Phones", Tablet: "Tablets", Accessories: "Accessories" };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const byId = (id) => products.find((p) => p.id === String(id));
  const url = (p) => "product.html?id=" + encodeURIComponent(p.id);

  function card(p) {
    return `
      <a class="product-card" href="${url(p)}">
        <div class="product-card-img"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></div>
        <span class="product-card-brand">${esc(p.brand)} · ${esc(TYPE_LABEL[p.type] || p.type)}</span>
        <h3>${esc(p.name)}</h3>
        <div class="swatches">${p.colors.map((c) => `<i style="background:${COLORS[c] || "#ccc"}" title="${esc(c)}"></i>`).join("")}</div>
        <span class="product-card-price">${money(p.price)}</span>
      </a>`;
  }

  function toast(html) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.innerHTML = html;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3500);
  }

  // ---------- devices.html : catalogue with filters ----------
  function renderDevices() {
    const root = document.getElementById("shop");
    const brands = [...new Set(products.map((p) => p.brand))].sort();
    const state = { type: params.get("type") || "", brands: new Set(), sort: "featured" };

    root.innerHTML = `
      <aside class="filters">
        <h3>Category</h3>
        <div class="filter-types">
          ${[["", "All devices"], ...Object.entries(TYPE_LABEL)].map(([t, l]) =>
            `<button data-type="${t}">${l}</button>`).join("")}
        </div>
        <h3>Brand</h3>
        ${brands.map((b) => `<label><input type="checkbox" value="${esc(b)}"> ${esc(b)}</label>`).join("")}
      </aside>
      <section class="shop-results">
        <div class="shop-toolbar">
          <h1 id="shop-title"></h1>
          <select id="sort">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
        <p class="shop-count" id="shop-count"></p>
        <div class="product-grid" id="grid"></div>
      </section>`;

    function draw() {
      let list = products.filter((p) => (!state.type || p.type === state.type) &&
        (!state.brands.size || state.brands.has(p.brand)));
      const sorters = {
        featured: (a, b) => Number(a.id) - Number(b.id),
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        name: (a, b) => a.name.localeCompare(b.name),
      };
      list = list.slice().sort(sorters[state.sort]);
      document.getElementById("shop-title").textContent = TYPE_LABEL[state.type] || "All devices";
      document.getElementById("shop-count").textContent = list.length + " products";
      document.getElementById("grid").innerHTML = list.map(card).join("");
      root.querySelectorAll(".filter-types button").forEach((b) =>
        b.classList.toggle("active", b.dataset.type === state.type));
    }

    root.querySelectorAll(".filter-types button").forEach((b) => b.addEventListener("click", () => {
      state.type = b.dataset.type;
      const u = new URL(window.location);
      state.type ? u.searchParams.set("type", state.type) : u.searchParams.delete("type");
      history.replaceState(null, "", u);
      draw();
    }));
    root.querySelectorAll(".filters input[type=checkbox]").forEach((c) => c.addEventListener("change", () => {
      c.checked ? state.brands.add(c.value) : state.brands.delete(c.value);
      draw();
    }));
    document.getElementById("sort").addEventListener("change", (e) => { state.sort = e.target.value; draw(); });
    draw();
  }

  // ---------- product.html?id=X : product detail ----------
  function renderProduct() {
    const p = byId(params.get("id"));
    const main = document.getElementById("product");
    if (!p) {
      main.innerHTML = `<div class="empty"><h1>Product not found</h1><a class="cart-btn" href="devices.html">Browse devices</a></div>`;
      return;
    }
    document.title = p.name + " | Quadstar";
    // Read by the Data Cloud sitemap (Product__dlm ID__c / Price__c)
    main.dataset.productId = p.id;
    main.dataset.productPrice = p.price;

    const storage = p.type === "Accessories" ? "" : `
      <div class="cable-config">
        <span>Storage size</span>
        <div class="cable-choose">
          ${["64 GB", "128 GB", "256 GB"].map((s, i) => `<button class="${i ? "" : "selected"}">${s}</button>`).join("")}
        </div>
        <a href="#">How to configure your ${p.type === "Phone" ? "phone" : "tablet"}</a>
      </div>`;

    main.innerHTML = `
      <div class="left-column"><img class="active" src="${esc(p.image)}" alt="${esc(p.name)}"></div>
      <div class="right-column">
        <div class="product-description">
          <span><a href="devices.html?type=${encodeURIComponent(p.type)}">${esc(TYPE_LABEL[p.type] || p.type)}</a> · ${esc(p.brand)}</span>
          <h1>${esc(p.name)}</h1>
          <p>${esc(p.description)}</p>
        </div>
        <div class="product-configuration">
          <div class="product-color">
            <span>Color${p.colors.length ? ": <b id='color-name'>" + esc(p.colors[0]) + "</b>" : ""}</span>
            <div class="color-choose">
              ${p.colors.map((c, i) => `
                <div>
                  <input type="radio" id="color-${i}" name="color" value="${esc(c)}"${i ? "" : " checked"}>
                  <label for="color-${i}"><span style="background-color:${COLORS[c] || "#ccc"}"></span></label>
                </div>`).join("")}
            </div>
          </div>
          ${storage}
        </div>
        <div class="product-price">
          <span>${money(p.price)}</span>
          <div class="qty">
            <button type="button" data-step="-1" aria-label="Decrease">−</button>
            <input id="qty" type="number" min="1" max="10" value="1" aria-label="Quantity">
            <button type="button" data-step="1" aria-label="Increase">+</button>
          </div>
          <a href="#" id="add-to-cart" class="cart-btn">Add to cart</a>
        </div>
        <p class="delivery">Free delivery in 2-3 business days · Free returns within 30 days</p>
      </div>`;

    main.querySelectorAll("input[name=color]").forEach((r) => r.addEventListener("change", () => {
      document.getElementById("color-name").textContent = r.value;
    }));
    main.querySelectorAll(".cable-choose button").forEach((b) => b.addEventListener("click", () => {
      main.querySelectorAll(".cable-choose button").forEach((x) => x.classList.toggle("selected", x === b));
    }));
    const qty = document.getElementById("qty");
    main.querySelectorAll(".qty button").forEach((b) => b.addEventListener("click", () => {
      qty.value = Math.min(10, Math.max(1, Number(qty.value) + Number(b.dataset.step)));
    }));
    document.getElementById("add-to-cart").addEventListener("click", (e) => {
      e.preventDefault();
      const n = Math.max(1, Number(qty.value) || 1);
      cart.add(p.id, n);
      toast(`<b>${esc(p.name)}</b> × ${n} added to your cart. <a href="cart.html">View cart</a>`);
    });

    const related = products.filter((x) => x.type === p.type && x.id !== p.id)
      .sort((a, b) => (a.brand === p.brand ? 0 : 1) - (b.brand === p.brand ? 0 : 1) ||
        Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
      .slice(0, 4);
    document.getElementById("related").innerHTML = related.map(card).join("");
  }

  // ---------- cart.html ----------
  function renderCart() {
    const root = document.getElementById("cart");
    const items = cart.items();
    if (!items.length) {
      root.innerHTML = `<div class="empty"><h1>Your cart is empty</h1><a class="cart-btn" href="devices.html">Browse devices</a></div>`;
      return;
    }
    root.innerHTML = `
      <h1>Your cart</h1>
      <div class="cart-layout">
        <div class="cart-lines">
          ${items.map(({ product: p, qty }) => `
            <div class="cart-line" data-id="${esc(p.id)}">
              <a href="${url(p)}"><img src="${esc(p.image)}" alt="${esc(p.name)}"></a>
              <div class="cart-line-info">
                <a href="${url(p)}"><h3>${esc(p.name)}</h3></a>
                <span>${esc(p.brand)} · ${money(p.price)}</span>
              </div>
              <div class="qty">
                <button type="button" data-step="-1" aria-label="Decrease">−</button>
                <input type="number" min="1" max="10" value="${qty}" aria-label="Quantity">
                <button type="button" data-step="1" aria-label="Increase">+</button>
              </div>
              <b class="cart-line-total">${money(p.price * qty)}</b>
              <button class="link-btn remove" type="button">Remove</button>
            </div>`).join("")}
        </div>
        <aside class="cart-summary">
          <h3>Order summary</h3>
          <p><span>Subtotal</span><span>${money(cart.total())}</span></p>
          <p><span>Shipping</span><span>Free</span></p>
          <p class="cart-summary-total"><span>Total</span><span>${money(cart.total())}</span></p>
          <a class="cart-btn" href="checkout.html">Checkout</a>
          <a class="continue" href="devices.html">Continue shopping</a>
        </aside>
      </div>`;

    root.querySelectorAll(".cart-line").forEach((line) => {
      const id = line.dataset.id;
      const input = line.querySelector("input");
      line.querySelectorAll(".qty button").forEach((b) => b.addEventListener("click", () => {
        cart.setQty(id, Math.min(10, Number(input.value) + Number(b.dataset.step)));
        renderCart();
      }));
      input.addEventListener("change", () => { cart.setQty(id, Math.min(10, Number(input.value) || 0)); renderCart(); });
      line.querySelector(".remove").addEventListener("click", () => { cart.remove(id); renderCart(); });
    });
  }

  // ---------- checkout.html ----------
  function renderCheckout() {
    const root = document.getElementById("checkout");
    const items = cart.items();
    if (!items.length) {
      root.innerHTML = `<div class="empty"><h1>Your cart is empty</h1><a class="cart-btn" href="devices.html">Browse devices</a></div>`;
      return;
    }
    const user = JSON.parse(localStorage.getItem("quadstar.user") || "null") || {};
    root.innerHTML = `
      <h1>Checkout</h1>
      <div class="cart-layout">
        <form id="checkout-form" class="checkout-form">
          <h3>Contact</h3>
          <label>Email<input name="email" type="email" required value="${esc(user.email || "")}"></label>
          <h3>Shipping address</h3>
          <div class="row">
            <label>First name<input name="firstName" required value="${esc(user.firstName || "")}"></label>
            <label>Last name<input name="lastName" required value="${esc(user.lastName || "")}"></label>
          </div>
          <label>Address<input name="address" required></label>
          <div class="row">
            <label>Postal code<input name="postalCode" required></label>
            <label>City<input name="city" required></label>
          </div>
          <label>Country<select name="country"><option>France</option><option>United States</option><option>United Kingdom</option><option>Germany</option></select></label>
          <h3>Delivery</h3>
          <label class="radio"><input type="radio" name="delivery" value="home" checked> Home delivery (2-3 days) — Free</label>
          <label class="radio"><input type="radio" name="delivery" value="store"> Pick up in store — Free</label>
          <h3>Payment</h3>
          <p class="demo-note">Demo site: no payment is collected and no order will be processed.</p>
          <button class="cart-btn" type="submit">Place order · ${money(cart.total())}</button>
        </form>
        <aside class="cart-summary">
          <h3>Your order</h3>
          ${items.map(({ product: p, qty }) => `<p><span>${esc(p.name)} × ${qty}</span><span>${money(p.price * qty)}</span></p>`).join("")}
          <p><span>Shipping</span><span>Free</span></p>
          <p class="cart-summary-total"><span>Total</span><span>${money(cart.total())}</span></p>
        </aside>
      </div>`;

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const customer = Object.fromEntries(new FormData(e.target));
      const button = e.target.querySelector("button[type=submit]");
      button.disabled = true;
      button.textContent = "Placing order…";
      cart.checkout(customer);
      // Leave the Web SDK time to send the Purchase event before leaving the page
      setTimeout(() => { window.location.href = "confirmation.html"; }, 1200);
    });
  }

  // ---------- confirmation.html ----------
  function renderConfirmation() {
    const root = document.getElementById("confirmation");
    const order = cart.lastOrder();
    if (!order) {
      root.innerHTML = `<div class="empty"><h1>No recent order</h1><a class="cart-btn" href="devices.html">Browse devices</a></div>`;
      return;
    }
    const c = order.customer || {};
    root.innerHTML = `
      <div class="confirmation">
        <img src="images/check-icn.svg" alt="" class="confirmation-icon">
        <h1>Thank you${c.firstName ? ", " + esc(c.firstName) : ""}!</h1>
        <p>Your order <b>${esc(order.id)}</b> has been placed. A confirmation email will be sent to <b>${esc(c.email || "")}</b>.</p>
        <div class="cart-summary">
          ${order.lineItems.map((li) => {
            const p = byId(li.catalogObjectId);
            return `<p><span>${esc(p ? p.name : li.catalogObjectId)} × ${li.quantity}</span><span>${money(li.price * li.quantity)}</span></p>`;
          }).join("")}
          <p class="cart-summary-total"><span>Total</span><span>${money(order.totalValue)}</span></p>
        </div>
        <a class="cart-btn" href="devices.html">Continue shopping</a>
      </div>`;
  }

  // ---------- index.html : best sellers ----------
  function renderHome() {
    const el = document.getElementById("featured");
    if (el) el.innerHTML = ["1", "3", "2", "6"].map(byId).filter(Boolean).map(card).join("");
  }

  const pages = {
    home: renderHome, devices: renderDevices, product: renderProduct,
    cart: renderCart, checkout: renderCheckout, confirmation: renderConfirmation,
  };
  (pages[document.body.dataset.page] || (() => {}))();
})();
