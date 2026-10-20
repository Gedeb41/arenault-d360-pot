// Shared header / footer, injected into <header id="site-header"> and <footer id="site-footer">.
// Page key comes from <body data-page="...">.
(function () {
  const page = document.body.dataset.page || "";

  const nav = [
    ["home", "index.html", "Home"],
    ["devices", "devices.html", "Shop"],
    ["contact", "#contact", "Contact"],
    ["about", "#about", "About"],
  ];

  const menu = [
    ["devices.html", "ALL DEVICES"],
    ["devices.html?type=Phone", "PHONES"],
    ["devices.html?type=Tablet", "TABLETS"],
    ["devices.html?type=Accessories", "ACCESSORIES"],
    ["#", "INTERNET"],
    ["#", "BUNDLES"],
    ["#", "ONLY ON QUADSTAR"],
  ];

  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
    <div class="header">
        <a href="index.html" class="logo"><img src="images/quadstarlogo.png" alt="Quadstar"></a>
        <div class="header-right">
            ${nav.map(([key, href, label]) => `<a href="${href}"${key === page ? ' class="active"' : ""}>${label}</a>`).join("")}
            <a href="#register" class="login" onclick="displayRegisterForm(); return false;">Register</a>
            <a href="#login" class="login" id="login-link" onclick="displayAuthForm(); return false;">Login</a>
            <a href="cart.html" class="cart-link${page === "cart" ? " active" : ""}" aria-label="Cart">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5.2 4l.6 3H21l-2 8H7.4L4.4 2H1v2h2.6"/></svg>
                <span class="cart-count" id="cart-count">0</span>
            </a>
        </div>
    </div>

    <div id="registerform" style="visibility: hidden;">
        <div class="close" onclick="hideRegisterForm();"></div>
        <form id="registerForm" onsubmit="submitRegisterForm();return false;">
            <label for="firstname">First Name:</label>
            <input id="firstname" type="text" value="Alexis">
            <label for="lastname">Last Name:</label>
            <input id="lastname" type="text" value="Renault">
            <label for="email">Email:</label>
            <input id="email" type="email" value="alexis.renault@demo.com">
            <label for="username">Username:</label>
            <input id="username" type="email" value="alexis.renault@demo.com">
            <input type="submit" value="Register">
        </form>
    </div>

    <div id="loginform" style="visibility: hidden;">
        <div class="close" onclick="hideAuthForm();"></div>
        <form id="authenticationForm" onsubmit="submitAuthForm();return false;">
            <label for="login">Login:</label>
            <input id="login" type="email" value="alexis.renault@demo.com">
            <input type="submit" value="Login">
        </form>
    </div>

    <nav class="menu">
        <ul>
            ${menu.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}
        </ul>
    </nav>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.outerHTML = `
    <footer class="footer">
    <div class="footer-container">
        <div class="footer-section">
            <h3>Shop By Category</h3>
            <ul>
                <li><a href="devices.html?type=Phone">Phones</a></li>
                <li><a href="devices.html?type=Tablet">Tablets</a></li>
                <li><a href="devices.html?type=Accessories">Accessories</a></li>
            </ul>
        </div>
        <div class="footer-section">
            <h3>Resources</h3>
            <ul>
                <li><a href="#">My Account</a></li>
                <li><a href="#">My Business</a></li>
                <li><a href="#">Order Status</a></li>
                <li><a href="#">Add Services</a></li>
            </ul>
        </div>
        <div class="footer-section">
            <h3>Customer Service</h3>
            <ul>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Repair Tickets</a></li>
                <li><a href="#">Outages</a></li>
            </ul>
        </div>
        <div class="footer-section">
            <h3>About</h3>
            <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">News</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; Copyright 2025 Salesforce.com, inc. | Quadstar is not a real company. It is used for Salesforce demos. No orders will be processed.</p>
        <ul>
            <li><a href="#">Legal</a></li>
            <li><a href="#">Terms Of Service</a></li>
            <li><a href="#">Privacy Information</a></li>
            <li><a href="#">Contact</a></li>
        </ul>
    </div>
    </footer>`;
  }

  // Form toggles normally come from the hosted sitemap; keep the site usable without the beacon
  const toggle = (id, visibility) => () => {
    const el = document.getElementById(id);
    if (el) el.style.visibility = visibility;
  };
  window.displayAuthForm = window.displayAuthForm || toggle("loginform", "visible");
  window.hideAuthForm = window.hideAuthForm || toggle("loginform", "hidden");
  window.displayRegisterForm = window.displayRegisterForm || toggle("registerform", "visible");
  window.hideRegisterForm = window.hideRegisterForm || toggle("registerform", "hidden");

  // Remember who logged in / registered, to greet them and prefill the checkout
  const USER_KEY = "quadstar.user";
  const loginLink = () => document.getElementById("login-link");
  function showUser() {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    if (user && loginLink()) loginLink().textContent = "Hi, " + (user.firstName || user.email.split("@")[0]);
  }
  document.getElementById("authenticationForm")?.addEventListener("submit", (e) => {
    const email = e.target.elements["login"].value;
    const prev = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    localStorage.setItem(USER_KEY, JSON.stringify(prev && prev.email === email ? prev : { email }));
    showUser();
  });
  document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    const f = e.target.elements;
    localStorage.setItem(USER_KEY, JSON.stringify({
      email: f["email"].value, firstName: f["firstname"].value, lastName: f["lastname"].value,
    }));
    showUser();
  });
  showUser();
})();
