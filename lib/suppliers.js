/**
 * Multi-Supplier Abstraction Layer
 * Add Printful, Gelato, or any POD API here.
 * All suppliers expose the same interface: getProducts, getProduct, createOrder.
 */

const { PrintifyClient } = require("./printify");

class SupplierManager {
  constructor() {
    this.suppliers = {};
  }

  addSupplier(name, client) {
    this.suppliers[name] = client;
  }

  getSupplier(name) {
    return this.suppliers[name];
  }

  // Aggregate products from all suppliers
  async getAllProducts() {
    const all = [];
    for (const [name, client] of Object.entries(this.suppliers)) {
      try {
        const products = await client.getProducts();
        products.forEach(p => { p.supplier = name; });
        all.push(...products);
      } catch (err) {
        console.error(`[${name}] Failed to fetch products:`, err.message);
      }
    }
    return all;
  }

  // Route order to the correct supplier
  async placeOrder(supplierName, items, shipping) {
    const client = this.suppliers[supplierName];
    if (!client) throw new Error(`Unknown supplier: ${supplierName}`);
    return client.createOrder(items, shipping);
  }
}

// Factory — call once at startup
function initSuppliers(config) {
  const manager = new SupplierManager();

  if (config.printifyKey && config.printifyShopId) {
    manager.addSupplier("printify", new PrintifyClient(config.printifyKey, config.printifyShopId));
    console.log("[suppliers] Printify connected");
  }

  // Future: add Printful, Gelato, etc.
  // if (config.printfulKey) {
  //   manager.addSupplier("printful", new PrintfulClient(config.printfulKey));
  // }

  return manager;
}

module.exports = { SupplierManager, initSuppliers };
