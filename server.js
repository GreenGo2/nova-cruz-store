#!/usr/bin/env node
/**
 * Nova Cruz Store — Custom Node.js Ecommerce
 * Express + EJS + Stripe + Printify (optional)
 *
 * Usage: node server.js
 *        PORT=8080 node server.js
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { getProducts, getProduct, getCollections } = require("./lib/catalog");
const { initSuppliers } = require("./lib/suppliers");

const app = express();
const PORT = parseInt(process.env.PORT) || parseInt(process.env.RAILWAY_PORT) || 8080;

// ── Config ─────────────────────────────────────────────────────
const config = {
  printifyKey: process.env.PRINTIFY_API_KEY,
  printifyShopId: process.env.PRINTIFY_SHOP_ID || "27652520",
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  stripePublic: process.env.STRIPE_PUBLIC_KEY,
  storeName: "Nova Cruz",
  storeUrl: process.env.STORE_URL || `http://localhost:${PORT}`,
  currency: "USD",
};

// ── Brand constants ─────────────────────────────────────────────
const BRAND = {
  name: "Nova Cruz",
  tagline: "Show Up. Never Give Up.",
  description: "Premium gym wear designed for the grind.",
  instagram: "@nova.cruz.fit",
  colors: {
    green: "#1a3a2a",
    gold: "#d4a853",
    cream: "#faf8f5",
    white: "#ffffff",
    black: "#1a1a1a",
    charcoal: "#2d2d2d",
    burgundy: "#722f37",
  },
};

const suppliers = initSuppliers(config);

// ── Middleware ──────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "nova-cruz-session-secret-2025",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Inject global view variables
app.use((req, res, next) => {
  res.locals.BRAND = BRAND;
  res.locals.storeName = config.storeName;
  res.locals.storeUrl = config.storeUrl;
  res.locals.stripePublic = config.stripePublic;
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = (req.session.cart || []).reduce((s, i) => s + i.quantity, 0);
  res.locals.currentPath = req.path;
  next();
});

// ── Helpers ─────────────────────────────────────────────────────

async function loadProducts() {
  // Try Printify first, fall back to local catalog
  if (config.printifyKey) {
    try {
      const products = await suppliers.getAllProducts();
      if (products && products.length > 0) return products;
    } catch (err) {
      console.warn("Printify sync failed, using catalog:", err.message);
    }
  }
  // Transform catalog products to match Printify shape for template compat
  return getProducts().map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    images: p.images,
    image: p.image,
    variants: [{ title: "Default", price: p.price }],
    collection: p.collection,
    features: p.features,
    colors: p.colors,
    sizes: p.sizes,
  }));
}

// ── Routes: Storefront ─────────────────────────────────────────

app.get("/", async (req, res) => {
  try {
    const products = await loadProducts();
    const collections = getCollections();
    res.render("home", {
      products: products.slice(0, 8),
      collections,
      error: null,
    });
  } catch (err) {
    res.render("home", {
      products: [],
      collections: [],
      error: "Store syncing — check back soon.",
    });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await loadProducts();
    const collectionId = req.query.collection;
    const filtered = collectionId
      ? products.filter(p => p.collection === collectionId)
      : products;
    const collections = getCollections();
    res.render("products", {
      products: filtered,
      collections,
      activeCollection: collectionId,
      error: null,
    });
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).render("products", {
      products: [],
      collections: [],
      error: err.message,
    });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    // Try Printify first
    let product = null;
    if (config.printifyKey) {
      try {
        product = await suppliers.getSupplier("printify").getProduct(req.params.id);
      } catch (_) {
        // Fallback to catalog
      }
    }
    if (!product) {
      const catProduct = getProduct(req.params.id);
      if (!catProduct) return res.redirect("/products");
      product = {
        id: catProduct.id,
        title: catProduct.title,
        description: catProduct.description,
        price: catProduct.price,
        images: catProduct.images,
        image: catProduct.image,
        variants: [{ title: "Default", price: catProduct.price }],
        collection: catProduct.collection,
        features: catProduct.features || [],
        colors: catProduct.colors || [],
        sizes: catProduct.sizes || [],
      };
    }

    // Get related products from same collection
    const allProducts = await loadProducts();
    const related = allProducts
      .filter(p => p.collection === product.collection && p.id !== product.id)
      .slice(0, 4);

    res.render("product", { product, related });
  } catch (err) {
    console.error("Error loading product:", err);
    res.redirect("/products");
  }
});

// ── Cart ───────────────────────────────────────────────────────

app.post("/cart/add", (req, res) => {
  const { productId, variantId, title, price, image, size, color, quantity } = req.body;
  if (!req.session.cart) req.session.cart = [];

  const key = `${productId}-${variantId || "default"}-${size || ""}-${color || ""}`;
  const existing = req.session.cart.find(i => i.key === key);

  if (existing) {
    existing.quantity += parseInt(quantity) || 1;
  } else {
    req.session.cart.push({
      key,
      productId,
      variantId: variantId || "default",
      title,
      price,
      image,
      size: size || "",
      color: color || "",
      quantity: parseInt(quantity) || 1,
      supplier: "catalog",
    });
  }
  // Redirect back to the page they came from, or cart
  const referer = req.get("Referer") || "/cart";
  res.redirect(referer.includes("/cart") ? "/cart" : referer.includes("/products") ? referer : "/cart");
});

app.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;
  res.render("cart", {
    cart,
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    freeShippingThreshold: 75,
  });
});

app.post("/cart/update", (req, res) => {
  const { index, quantity } = req.body;
  if (req.session.cart && req.session.cart[parseInt(index)]) {
    const qty = parseInt(quantity);
    if (qty > 0) {
      req.session.cart[parseInt(index)].quantity = qty;
    } else {
      req.session.cart.splice(parseInt(index), 1);
    }
  }
  res.redirect("/cart");
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

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  res.render("checkout", {
    cart,
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    error: null,
  });
});

app.post("/checkout", async (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");

  const { firstName, lastName, email, phone, address, city, state, zip } = req.body;
  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  // Try Stripe
  if (config.stripeSecret) {
    try {
      const stripe = require("stripe")(config.stripeSecret);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: cart.map(item => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.title + (item.size ? ` — ${item.size}` : ""),
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(parseFloat(item.price) * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${config.storeUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.storeUrl}/cart`,
        customer_email: email,
        shipping_address_collection: { allowed_countries: ["US"] },
        metadata: { firstName, lastName, phone },
      });
      return res.redirect(session.url);
    } catch (err) {
      console.error("Stripe error:", err.message);
      return res.render("checkout", {
        cart,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        error: "Payment processing error. Please try again.",
      });
    }
  }

  // No Stripe — demo mode
  const orderId = "NOVA-" + Date.now().toString(36).toUpperCase();
  req.session.cart = [];
  req.session.lastOrder = orderId;
  res.redirect(`/order-confirmed?orderId=${orderId}`);
});

app.get("/order-confirmed", (req, res) => {
  const orderId = req.query.orderId || req.session.lastOrder || "NOVA-" + Date.now().toString(36).toUpperCase();
  res.render("order-confirmed", { orderId });
});

// ── About ──────────────────────────────────────────────────────

app.get("/about", (req, res) => {
  res.render("about");
});

// ── Admin ──────────────────────────────────────────────────────

app.get("/admin", async (req, res) => {
  try {
    const products = await loadProducts();
    res.render("admin", { products, error: null });
  } catch (err) {
    res.render("admin", { products: [], error: err.message });
  }
});

app.post("/admin/sync", async (req, res) => {
  try {
    const products = await loadProducts();
    res.json({ success: true, count: products.length, source: config.printifyKey ? "Printify" : "Catalog" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── Health ─────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    store: config.storeName,
    mode: config.stripeSecret ? "live" : "demo",
    products: getProducts().length,
  });
});

// ── 404 ────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).render("404");
});

// ── Start ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  const border = "─".repeat(40);
  console.log(`\n  ${border}`);
  console.log(`  🏋️   ${BRAND.name.toUpperCase()} STORE`);
  console.log(`  📍  http://localhost:${PORT}`);
  console.log(`  💳  ${config.stripeSecret ? "Stripe LIVE" : "Demo mode (no Stripe)"}`);
  console.log(`  🛒  ${config.printifyKey ? "Printify connected" : `Catalog mode (${getProducts().length} products)`}`);
  console.log(`  ${border}\n`);
});
