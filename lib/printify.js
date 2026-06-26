/**
 * Printify API Client — sync products, create orders, manage store.
 * Also serves as the base supplier class for multi-supplier support.
 */

const PRINTIFY_BASE = "https://api.printify.com/v1";

class PrintifyClient {
  constructor(apiKey, shopId) {
    this.apiKey = apiKey;
    this.shopId = shopId;
    this.headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async _fetch(path, opts = {}) {
    const url = `${PRINTIFY_BASE}/shops/${this.shopId}${path}`;
    const res = await fetch(url, { ...opts, headers: this.headers });
    if (!res.ok) throw new Error(`Printify API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // ── Products ─────────────────────────────────────────────────

  async getProducts() {
    const data = await this._fetch("/products.json");
    return (data.data || []).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      images: (p.images || []).map(img => img.src),
      variants: (p.variants || []).map(v => ({
        id: v.id,
        price: (v.price / 100).toFixed(2),
        title: v.title,
        available: v.is_enabled,
      })),
      published: p.published,
      created_at: p.created_at,
    }));
  }

  async getProduct(productId) {
    const data = await this._fetch(`/products/${productId}.json`);
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      images: (data.images || []).map(img => img.src),
      variants: (data.variants || []).map(v => ({
        id: v.id,
        price: (v.price / 100).toFixed(2),
        title: v.title,
      })),
      tags: data.tags || [],
      options: data.options || [],
    };
  }

  // ── Orders ───────────────────────────────────────────────────

  async createOrder(items, shippingInfo) {
    const payload = {
      external_id: `nova-${Date.now()}`,
      shipping_method: 1, // Standard
      send_shipping_notification: true,
      address_to: {
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone || "",
        address1: shippingInfo.address,
        address2: shippingInfo.address2 || "",
        city: shippingInfo.city,
        region: shippingInfo.state,
        zip: shippingInfo.zip,
        country: shippingInfo.country || "US",
      },
      line_items: items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity || 1,
      })),
    };

    try {
      const data = await this._fetch("/orders.json", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, orderId: data.id, printifyId: data.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getOrders() {
    const data = await this._fetch("/orders.json");
    return (data.data || []).map(o => ({
      id: o.id,
      status: o.status,
      total: (o.total / 100).toFixed(2),
      created: o.created_at,
      items: o.line_items.length,
    }));
  }

  // ── Store Info ───────────────────────────────────────────────

  async getStoreInfo() {
    const data = await this._fetch(".json");
    return { id: data.id, title: data.title, domain: data.sales_channel };
  }
}

module.exports = { PrintifyClient };
