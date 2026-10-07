// Forméli & Co. - Reykjavik, Iceland
// Luxury Fashion Catalog & Editorial Data

const PRODUCTS_DATA = [
  {
    id: "coat-01",
    name: "Double-Breasted Cashmere Coat",
    category: "Coats",
    categoryKey: "coats",
    priceEUR: 480,
    priceISK: 72000,
    priceUSD: 520,
    rating: 4.9,
    reviewsCount: 38,
    isNew: true,
    isSignature: true,
    tagline: "Tailored in Reykjavik from 10% Icelandic wool & 90% Grade-A cashmere.",
    composition: "90% Mongolian Cashmere, 10% Icelandic Virgin Wool. Cupro lining.",
    care: "Specialist dry clean only. Store on shaped wooden hanger.",
    colors: [
      {
        name: "Dark Chocolate",
        hex: "#3E2B23",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Warm Oat",
        hex: "#CBB89E",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Camel",
        hex: "#AB664F",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Espresso",
        hex: "#241B17",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "knit-01",
    name: "Chunky Fisherman Turtleneck",
    category: "Knitwear",
    categoryKey: "knitwear",
    priceEUR: 260,
    priceISK: 39000,
    priceUSD: 285,
    rating: 5.0,
    reviewsCount: 52,
    isNew: false,
    isSignature: true,
    tagline: "Sub-arctic warmth with zero bulk. Hand-linked ribbed cuffs and mock neckline.",
    composition: "100% Certified Organic Cashmere (2-ply yarn).",
    care: "Hand wash cold with wool detergent or gentle dry clean. Dry flat.",
    colors: [
      {
        name: "Cream",
        hex: "#EDE1D4",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Oat",
        hex: "#CBB89E",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Mocha",
        hex: "#7B5A45",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "blazer-01",
    name: "Tailored Icelandic Wool Blazer",
    category: "Essentials",
    categoryKey: "essentials",
    priceEUR: 320,
    priceISK: 48000,
    priceUSD: 350,
    rating: 4.8,
    reviewsCount: 24,
    isNew: true,
    isSignature: false,
    tagline: "Structured shoulders with a relaxed drape. Made from un-dyed natural wool.",
    composition: "100% Icelandic Natural Sheep's Wool. Horn buttons.",
    care: "Dry clean only. Brush with soft bristle brush between wears.",
    colors: [
      {
        name: "Chocolate",
        hex: "#6A4735",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Taupe",
        hex: "#A8927B",
        image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Espresso",
        hex: "#241B17",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "trouser-01",
    name: "Pleated Wide-Leg Wool Trousers",
    category: "Essentials",
    categoryKey: "essentials",
    priceEUR: 280,
    priceISK: 42000,
    priceUSD: 305,
    rating: 4.9,
    reviewsCount: 31,
    isNew: false,
    isSignature: true,
    tagline: "High-waisted, architectural double pleats crafted for effortless fluid movement.",
    composition: "98% Virgin Wool, 2% Elastane for subtle comfort stretch.",
    care: "Dry clean only. Cool iron on reverse side.",
    colors: [
      {
        name: "Taupe",
        hex: "#A8927B",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Chocolate",
        hex: "#6A4735",
        image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Dark Chocolate",
        hex: "#3E2B23",
        image: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "cardigan-01",
    name: "Fine Merino Ribbed Cardigan",
    category: "Knitwear",
    categoryKey: "knitwear",
    priceEUR: 240,
    priceISK: 36000,
    priceUSD: 260,
    rating: 4.7,
    reviewsCount: 19,
    isNew: true,
    isSignature: false,
    tagline: "Ultra-fine 17.5 micron merino wool with natural mother-of-pearl buttons.",
    composition: "100% Extra-fine Australian Merino Wool (non-mulesed).",
    care: "Gentle wool wash 30°C. Reshape while wet.",
    colors: [
      {
        name: "Oat",
        hex: "#CBB89E",
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Cream",
        hex: "#EDE1D4",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Mocha",
        hex: "#7B5A45",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Black",
        hex: "#1E1A16",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "scarf-01",
    name: "Brushed Cashmere Cocoon Scarf",
    category: "Accessories",
    categoryKey: "accessories",
    priceEUR: 150,
    priceISK: 22500,
    priceUSD: 165,
    rating: 5.0,
    reviewsCount: 67,
    isNew: false,
    isSignature: true,
    tagline: "Oversized silhouette (210cm x 70cm) with delicate hand-twisted fringe.",
    composition: "100% Cashmere with signature water-ripple finishing.",
    care: "Dry clean or gentle hand wash in lukewarm water.",
    colors: [
      {
        name: "Camel",
        hex: "#AB664F",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Oat",
        hex: "#CBB89E",
        image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Espresso",
        hex: "#241B17",
        image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Taupe",
        hex: "#A8927B",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["One Size"]
  },
  {
    id: "bag-01",
    name: "Reykjavík Minimalist Leather Tote",
    category: "Accessories",
    categoryKey: "accessories",
    priceEUR: 390,
    priceISK: 58500,
    priceUSD: 425,
    rating: 4.9,
    reviewsCount: 15,
    isNew: true,
    isSignature: true,
    tagline: "Sculptural lines, plant-tanned calfskin, lined in unbleached organic linen.",
    composition: "100% Vegetable-tanned Italian Calf Leather. Palladium hardware.",
    care: "Condition with beeswax leather balm twice yearly. Keep away from direct water.",
    colors: [
      {
        name: "Espresso",
        hex: "#241B17",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Chocolate",
        hex: "#6A4735",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["Medium", "Large"]
  },
  {
    id: "coat-02",
    name: "Cocoon Belted Wrap Coat",
    category: "Coats",
    categoryKey: "coats",
    priceEUR: 520,
    priceISK: 78000,
    priceUSD: 565,
    rating: 4.9,
    reviewsCount: 42,
    isNew: false,
    isSignature: true,
    tagline: "Unstructured elegance with sweeping storm lapels and self-tie sash belt.",
    composition: "100% Double-faced Virgin Wool.",
    care: "Dry clean only. Steam gently to refresh fibers.",
    colors: [
      {
        name: "Camel",
        hex: "#AB664F",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Oat",
        hex: "#CBB89E",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85"
      },
      {
        name: "Dark Chocolate",
        hex: "#3E2B23",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
        hoverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
      }
    ],
    sizes: ["XS", "S", "M", "L"]
  }
];

const COLOR_PALETTE_GUIDE = [
  { name: "Cream", hex: "#EDE1D4", role: "Base & Lightness", desc: "Illuminating neutral that brings crisp contrast." },
  { name: "Oat", hex: "#CBB89E", role: "Soft Core", desc: "Gentle Scandinavian warmth mimicking natural fleece." },
  { name: "Taupe", hex: "#A8927B", role: "Balancing Hue", desc: "Muted earth stone tone that grounds everyday styling." },
  { name: "Mocha", hex: "#7B5A45", role: "Medium Depth", desc: "Smooth coffee roast tone with subtle cinnamon undertones." },
  { name: "Chocolate", hex: "#6A4735", role: "Signature Hue", desc: "Rich roasted cacao creating high-editorial elegance." },
  { name: "Dark Chocolate", hex: "#3E2B23", role: "Structured Depth", desc: "Deep velvety brown replacing traditional black." },
  { name: "Espresso", hex: "#241B17", role: "Ultimate Anchor", desc: "The deepest roasted tone for outerwear and tailored coats." },
  { name: "Camel", hex: "#AB664F", role: "Luxe Contrast", desc: "Heritage warmth reminiscent of timeless desert and vicuña wool." }
];

const COLOR_PAIRINGS = [
  {
    title: "Chocolate & Cream",
    mood: "Elegant · Classic",
    desc: "A timeless, high-contrast duo evoking vintage Italian cinema and crisp Nordic daylight.",
    hex1: "#6A4735",
    hex2: "#EDE1D4"
  },
  {
    title: "Chocolate & Taupe",
    mood: "Warm · Everyday",
    desc: "Ton-sur-ton balance that feels effortlessly quiet, refined, and tactile for daily city walks.",
    hex1: "#6A4735",
    hex2: "#A8927B"
  },
  {
    title: "Chocolate & Black",
    mood: "Modern · Refined",
    desc: "A bold, avant-garde pairing once deemed unconventional, now the hallmark of quiet luxury.",
    hex1: "#3E2B23",
    hex2: "#1E1A16"
  },
  {
    title: "Chocolate & Camel",
    mood: "Rich · Luxurious",
    desc: "Warm caramel notes intertwined with dark roasted depth, inspired by high-alpine retreats.",
    hex1: "#6A4735",
    hex2: "#AB664F"
  }
];

const JOURNAL_ARTICLES = [
  {
    id: "journal-01",
    tag: "STYLE EDITORIAL",
    title: "Style into the New Season: A Reykjavik Guide to Transitional Dressing",
    summary: "How to navigate unpredictable sub-arctic sea winds through intelligent layering of featherweight cashmere and structured wool outerwear.",
    date: "Autumn / Winter 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "journal-02",
    tag: "PHILOSOPHY",
    title: "The Art of a Considered Wardrobe: Why 'Less, But Better' Resonates",
    summary: "Our design philosophy centers on removing the ephemeral noise of fast fashion in pursuit of eternal silhouettes that improve with age.",
    date: "Editorial No. 14",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "journal-03",
    tag: "TEXTILE ORIGINS",
    title: "From Icelandic Highlands to Mongolian Steppes: Sourcing Without Compromise",
    summary: "A deep dive into our ethical combing partnerships with nomadic herders and the rare water-repellent properties of native Icelandic Lopi fleece.",
    date: "Craftsmanship Series",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
  }
];
