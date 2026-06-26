/**
 * Nova Cruz Product Catalog
 * Hardcoded from markdown financial model. Syncs with Printify when API key is set.
 */

const catalog = {
  collections: [
    {
      id: "the-basics",
      name: "The Basics",
      description: "Foundation pieces. Built for the daily grind.",
      launchDate: "2025-03-15",
      image: "https://images.unsplash.com/photo-1517836357463-d25769a63512?w=800&q=80",
    },
    {
      id: "nova-signature",
      name: "Nova Signature",
      description: "Limited designs. Nova's personal favorites.",
      launchDate: "2025-06-01",
      image: "https://images.unsplash.com/photo-1549476464-373922117c43?w=800&q=80",
    },
  ],

  products: [
    {
      id: "foundation-hoodie",
      title: "The Foundation Hoodie",
      collection: "the-basics",
      price: "64.99",
      cost: "29.99",
      description: "Heavyweight fleece. Dropped shoulders. The hoodie you'll live in.",
      features: ["400GSM heavyweight cotton", "Oversized fit", "Ribbed cuffs and hem", "Embroidered logo"],
      colors: ["Black", "Forest Green", "Cream"],
      sizes: ["XS", "S", "M", "L", "XL", "2XL"],
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d63a?w=600&q=80",
      ],
    },
    {
      id: "standard-tee",
      title: "The Standard Tee",
      collection: "the-basics",
      price: "29.99",
      cost: "12.99",
      description: "Premium cotton tee. Clean cut. No distractions.",
      features: ["220GSM combed cotton", "Athletic fit", "Reinforced collar", "Subtle chest logo"],
      colors: ["Black", "White", "Forest Green", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL", "2XL"],
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      ],
    },
    {
      id: "grind-tank",
      title: "Grind Tank",
      collection: "the-basics",
      price: "34.99",
      cost: "15.99",
      description: "Racerback tank. Maximum range of motion.",
      features: ["Lightweight performance fabric", "Racerback cut", "Moisture-wicking", "Drop hem"],
      colors: ["Black", "White", "Forest Green"],
      sizes: ["XS", "S", "M", "L", "XL"],
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      ],
    },
    {
      id: "legacy-leggings",
      title: "Legacy Leggings",
      collection: "the-basics",
      price: "44.99",
      cost: "19.99",
      description: "High-waisted. Squat-proof. Built to last.",
      features: ["High-waisted compression fit", "Squat-proof fabric", "Hidden waistband pocket", "4-way stretch"],
      colors: ["Black", "Forest Green", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL"],
      image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
        "https://images.unsplash.com/photo-1549476464-373922117c43?w=600&q=80",
      ],
    },
    {
      id: "cruz-crop",
      title: "Cruz Crop",
      collection: "nova-signature",
      price: "34.99",
      cost: "15.99",
      description: "Cropped fit. Bold attitude. Nova's go-to.",
      features: ["Cropped length", "Soft-brushed fabric", "Raw hem detail", "Back print"],
      colors: ["Black", "White", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL"],
      image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80",
      ],
    },
    {
      id: "nova-sports-bra",
      title: "Nova Sports Bra",
      collection: "nova-signature",
      price: "39.99",
      cost: "17.99",
      description: "Medium support. All-day comfort. No digging in.",
      features: ["Medium support", "Removable cups", "Wide underband", "Criss-cross back"],
      colors: ["Black", "Forest Green", "Cream"],
      sizes: ["XS", "S", "M", "L", "XL"],
      image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      ],
    },
    {
      id: "momentum-joggers",
      title: "Momentum Joggers",
      collection: "nova-signature",
      price: "59.99",
      cost: "26.99",
      description: "Tapered fit. Tapered ankle. Keep moving.",
      features: ["French terry fabric", "Tapered leg", "Zippered pockets", "Elastic cuffs"],
      colors: ["Black", "Charcoal", "Forest Green"],
      sizes: ["XS", "S", "M", "L", "XL", "2XL"],
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      ],
    },
    {
      id: "limitless-shorts",
      title: "Limitless Shorts",
      collection: "nova-signature",
      price: "34.99",
      cost: "14.99",
      description: "5-inch inseam. No restrictions. Full send.",
      features: ["Lightweight woven fabric", "5-inch inseam", "Built-in brief liner", "Zip back pocket"],
      colors: ["Black", "Forest Green", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL"],
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
      ],
    },
  ],
};

/**
 * Get all products, optionally filtered by collection
 */
function getProducts(collectionId) {
  if (collectionId) {
    return catalog.products.filter(p => p.collection === collectionId);
  }
  return catalog.products;
}

/**
 * Get a single product by ID
 */
function getProduct(id) {
  return catalog.products.find(p => p.id === id) || null;
}

/**
 * Get all collections
 */
function getCollections() {
  return catalog.collections;
}

module.exports = { getProducts, getProduct, getCollections };
