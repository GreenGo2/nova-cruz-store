#!/usr/bin/env node
/**
 * Fit AI Brand Store — Custom Node.js ecommerce for Nova Cruz.
 * Express + EJS + Printify API + Stripe checkout.
 *
 * Usage: node server.js
 *        PORT=3000 node server.js
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { initSuppliers } = require("./lib/suppliers");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Config ─────────────────────────────────────────────────────
const config = {
  printifyKey: process.env.PRINTIFY_API_KEY,
  printifyShopId: process.env.PRINTIFY_SHOP_ID || "27652520",
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  stripePublic: process.env.STRIPE_PUBLIC_KEY,
  storeName: process.env.STORE_NAME || "Nova Cruz",
  storeUrl: process.env.STORE_URL || "http://localhost:3000",
};

const suppliers = initSuppliers(config);

// ── Middleware ──────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "nova-cruz-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

// Make config available to all views
app.use((req, res, next) => {
  res.locals.storeName = config.storeName;
  res.locals.storeUrl = config.storeUrl;
  res.locals.stripePublic = config.stripePublic;
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = (req.session.cart || []).reduce((s, i) => s + i.quantity, 0);
  next();
});

// ── Routes: Storefront ─────────────────────────────────────────

app.get("/", async (req, res) => {
  try {
    const products = await suppliers.getAllProducts();
    res.render("home", { products: products.slice(0, 8) });
  } catch (err) {
    res.render("home", { products: [], error: "Store syncing — check back soon." });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await suppliers.getAllProducts();
    res.render("products", { products });
  } catch (err) {
    res.render("products", { products: [], error: err.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await suppliers.getSupplier("printify").getProduct(req.params.id);
    res.render("product", { product });
  } catch (err) {
    res.redirect("/products");
  }
});

// ── Cart ───────────────────────────────────────────────────────

app.post("/cart/add", (req, res) => {
  const { productId, variantId, title, price, image, quantity } = req.body;
  if (!req.session.cart) req.session.cart = [];

  const existing = req.session.cart.find(
    i => i.productId === productId && i.variantId === variantId
  );
  if (existing) {
    existing.quantity += parseInt(quantity) || 1;
  } else {
    req.session.cart.push({
      productId, variantId, title, price, image,
      quantity: parseInt(quantity) || 1,
      supplier: "printify",
    });
  }
  res.redirect("/cart");
});

app.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  res.render("cart", { cart, total: total.toFixed(2) });
});

app.post("/cart/remove/:index", (req, res) => {
  if (req.session.cart) {
    req.session.cart.splice(parseInt(req.params.index), 1);
  }
  res.redirect("/cart");
});

// ── Checkout ───────────────────────────────────────────────────

app.get("/checkout", (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");
  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  res.render("checkout", { cart, total: total.toFixed(2) });
});

app.post("/checkout", async (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");

  const { firstName, lastName, email, phone, address, city, state, zip } = req.body;
  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  // Create Stripe checkout session
  if (config.stripeSecret) {
    try {
      const stripe = require("stripe")(config.stripeSecret);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: cart.map(item => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.title, images: item.image ? [item.image] : [] },
            unit_amount: Math.round(parseFloat(item.price) * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${config.storeUrl}/order-confirmed`,
        cancel_url: `${config.storeUrl}/cart`,
        customer_email: email,
        metadata: { firstName, lastName, phone, address, city, state, zip },
      });
      return res.redirect(session.url);
    } catch (err) {
      console.error("Stripe error:", err.message);
    }
  }

  // No Stripe — place order directly via Printify
  try {
    const result = await suppliers.placeOrder("printify", cart, {
      firstName, lastName, email, phone, address, city, state, zip,
    });
    if (result.success) {
      req.session.cart = [];
      return res.render("order-confirmed", { orderId: result.orderId });
    }
    res.render("checkout", { cart, total: total.toFixed(2), error: result.error });
  } catch (err) {
    res.render("checkout", { cart, total: total.toFixed(2), error: err.message });
  }
});

app.get("/order-confirmed", (req, res) => {
  res.render("order-confirmed", { orderId: req.query.orderId || "NOVA-" + Date.now() });
});

// ── Admin ──────────────────────────────────────────────────────

app.get("/admin", async (req, res) => {
  try {
    const products = await suppliers.getAllProducts();
    const printify = suppliers.getSupplier("printify");
    const orders = await printify.getOrders();
    res.render("admin", { products, orders });
  } catch (err) {
    res.render("admin", { products: [], orders: [], error: err.message });
  }
});

app.post("/admin/sync", async (req, res) => {
  try {
    const products = await suppliers.getAllProducts();
    res.json({ success: true, count: products.length });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── Health ─────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ status: "ok", store: config.storeName, suppliers: Object.keys(suppliers.suppliers) });
});

// ── Start ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🏋️  ${config.storeName} Store`);
  console.log(`  📍 http://localhost:${PORT}`);
  console.log(`  🛒  Suppliers: ${Object.keys(suppliers.suppliers).join(", ") || "none"}\n`);
});
