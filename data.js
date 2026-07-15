// By jeje. Prototype - Default Data & Storage Management
window.LuxeData = (() => {
  // SVG Phone Case Render Helper
  // Returns SVG markup representing a realistic phone case mockup
  function getCaseSVG({
    style = 'clear', // 'clear', 'matte', 'marble', 'wood', 'gradient', 'leather', 'cyberpunk'
    color = '#1c1c1e', // hex color code
    customImage = null, // base64 or image data URL
    customText = '', 
    customTextColor = '#ffffff',
    customTextFont = 'sans-serif',
    customTextSize = 20,
    customTextX = 50, // % position
    customTextY = 75,
    customImageX = 50,
    customImageY = 45,
    customImageScale = 60,
    phoneModel = 'iPhone 15 Pro'
  }) {
    const isSamsung = phoneModel.toLowerCase().includes('samsung') || phoneModel.toLowerCase().includes('s24');
    const isPixel = phoneModel.toLowerCase().includes('pixel');

    // Camera cutout dimensions based on phone model
    let cameraCutout = '';
    if (isSamsung) {
      // 3 vertical lenses
      cameraCutout = `
        <rect x="18" y="18" width="16" height="42" rx="8" fill="#111" />
        <circle cx="26" cy="25" r="5" fill="#222" stroke="#444" stroke-width="0.5" />
        <circle cx="26" cy="25" r="2" fill="#000" />
        <circle cx="26" cy="39" r="5" fill="#222" stroke="#444" stroke-width="0.5" />
        <circle cx="26" cy="39" r="2" fill="#000" />
        <circle cx="26" cy="53" r="5" fill="#222" stroke="#444" stroke-width="0.5" />
        <circle cx="26" cy="53" r="2" fill="#000" />
      `;
    } else if (isPixel) {
      // Horizontal camera bar
      cameraCutout = `
        <rect x="8" y="18" width="84" height="16" rx="4" fill="#222" />
        <circle cx="35" cy="26" r="4.5" fill="#111" stroke="#444" stroke-width="0.5" />
        <circle cx="35" cy="26" r="1.5" fill="#000" />
        <circle cx="50" cy="26" r="4.5" fill="#111" stroke="#444" stroke-width="0.5" />
        <circle cx="50" cy="26" r="1.5" fill="#000" />
        <circle cx="75" cy="26" r="2.5" fill="#333" />
      `;
    } else {
      // iPhone square camera hump
      cameraCutout = `
        <rect x="14" y="14" width="34" height="34" rx="8" fill="#1c1c1e" stroke="#2c2c2e" stroke-width="1" />
        <circle cx="23" cy="23" r="6" fill="#111" stroke="#333" stroke-width="0.5" />
        <circle cx="23" cy="23" r="2.5" fill="#000" />
        <circle cx="39" cy="23" r="6" fill="#111" stroke="#333" stroke-width="0.5" />
        <circle cx="39" cy="23" r="2.5" fill="#000" />
        <circle cx="31" cy="37" r="6" fill="#111" stroke="#333" stroke-width="0.5" />
        <circle cx="31" cy="37" r="2.5" fill="#000" />
        <circle cx="39" cy="34" r="1.5" fill="#333" />
        <circle cx="23" cy="33" r="1" fill="#444" />
      `;
    }

    // Styles/Textures patterns
    let styleDef = '';
    let backgroundFill = `fill="${color}"`;

    if (style === 'clear') {
      backgroundFill = `fill="url(#clearGradient)"`;
      styleDef = `
        <linearGradient id="clearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
          <stop offset="50%" stop-color="${color}" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
        </linearGradient>
      `;
    } else if (style === 'gradient') {
      backgroundFill = `fill="url(#neonGradient)"`;
      styleDef = `
        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="50%" stop-color="#ec81b5" />
          <stop offset="100%" stop-color="#f15bb5" />
        </linearGradient>
      `;
    } else if (style === 'marble') {
      backgroundFill = `fill="url(#marbleBase)"`;
      styleDef = `
        <linearGradient id="marbleBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <pattern id="marbleVeins" x="0" y="0" width="100" height="140" patternUnits="userSpaceOnUse">
          <path d="M 10,-20 Q 30,30 50,40 T 90,110 T 110,160" fill="none" stroke="#ec81b5" stroke-width="0.75" opacity="0.6"/>
          <path d="M -10,40 Q 20,70 40,80 T 80,120 T 100,180" fill="none" stroke="#718096" stroke-width="0.5" opacity="0.3"/>
          <path d="M 60,0 Q 80,20 70,50 T 30,100 T 20,150" fill="none" stroke="#ec81b5" stroke-width="0.5" opacity="0.5"/>
        </pattern>
      `;
    } else if (style === 'wood') {
      backgroundFill = `fill="#855845"`;
      styleDef = `
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#a05a2c" />
          <stop offset="50%" stop-color="#744210" />
          <stop offset="100%" stop-color="#543005" />
        </linearGradient>
        <pattern id="woodGrain" x="0" y="0" width="100" height="140" patternUnits="userSpaceOnUse">
          <path d="M 0,10 Q 50,15 100,10 M 0,35 Q 50,45 100,35 M 0,65 Q 50,80 100,65 M 0,100 Q 50,115 100,100 M 0,130 Q 50,140 100,130" fill="none" stroke="#3d2004" stroke-width="1.5" opacity="0.25" />
        </pattern>
      `;
    } else if (style === 'leather') {
      backgroundFill = `fill="${color}"`;
      styleDef = `
        <pattern id="leatherGrain" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
          <circle cx="0.5" cy="0.5" r="0.4" fill="#000000" opacity="0.12" />
          <circle cx="1.5" cy="1.5" r="0.4" fill="#ffffff" opacity="0.08" />
        </pattern>
      `;
    } else if (style === 'cyberpunk') {
      backgroundFill = `fill="#0f0f1a"`;
      styleDef = `
        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00ffff" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#ec81b5" stop-opacity="0.4" />
        </linearGradient>
        <pattern id="cyberGrid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="none" stroke="url(#gridGrad)" stroke-width="0.3" opacity="0.6" />
        </pattern>
      `;
    }

    // Custom Image tag
    let imageElement = '';
    if (customImage) {
      const halfScale = customImageScale / 2;
      imageElement = `
        <g clip-path="url(#caseInnerClip)">
          <image href="${customImage}" 
                 x="${customImageX - halfScale}" 
                 y="${customImageY - (halfScale * 1.4)}" 
                 width="${customImageScale}" 
                 height="${customImageScale * 1.4}" 
                 preserveAspectRatio="xMidYMid slice" />
        </g>
      `;
    }

    // Custom Text tag
    let textElement = '';
    if (customText) {
      // Map font options to CSS stacks
      let fontStack = 'sans-serif';
      if (customTextFont === 'serif') fontStack = '"DM Serif Display", Playfair Display, Georgia, serif';
      if (customTextFont === 'monospace') fontStack = '"Courier New", Courier, monospace';
      if (customTextFont === 'handwriting') fontStack = '"Brush Script MT", cursive';
      if (customTextFont === 'modern') fontStack = '"Outfit", "Inter", sans-serif';

      textElement = `
        <g clip-path="url(#caseInnerClip)">
          <text x="${customTextX}%" y="${customTextY}%" 
                fill="${customTextColor}" 
                font-family="${fontStack}" 
                font-size="${customTextSize * 0.4}px" 
                font-weight="bold" 
                text-anchor="middle"
                dominant-baseline="middle"
                style="letter-spacing: 0.05em; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            ${customText}
          </text>
        </g>
      `;
    }

    // Clear case bumper outline
    const bumperStroke = style === 'clear' ? `stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5"` : `stroke="#2c2c2e" stroke-width="1"`;

    return `
      <svg viewBox="0 0 100 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="border-radius: 18px; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.15)); overflow: visible;">
        <defs>
          ${styleDef}
          <clipPath id="caseInnerClip">
            <rect x="4" y="4" width="92" height="132" rx="14" />
          </clipPath>
        </defs>
        
        <!-- Case Outer Border/Bumper -->
        <rect x="3" y="3" width="94" height="134" rx="16" ${backgroundFill} ${bumperStroke} />
        
        <!-- Style Specific Overlays -->
        ${style === 'marble' ? '<rect x="4" y="4" width="92" height="132" rx="14" fill="url(#marbleVeins)" />' : ''}
        ${style === 'wood' ? '<rect x="4" y="4" width="92" height="132" rx="14" fill="url(#woodGrain)" />' : ''}
        ${style === 'leather' ? '<rect x="4" y="4" width="92" height="132" rx="14" fill="url(#leatherGrain)" />' : ''}
        ${style === 'cyberpunk' ? `
          <rect x="4" y="4" width="92" height="132" rx="14" fill="url(#cyberGrid)" />
          <path d="M 10 10 L 90 10 L 90 130 L 10 130 Z" fill="none" stroke="#ec81b5" stroke-width="0.5" opacity="0.3"/>
          <path d="M 20 5 L 80 5" fill="none" stroke="#00ffff" stroke-width="1" opacity="0.8"/>
        ` : ''}
        
        <!-- Custom User Image -->
        ${imageElement}
        
        <!-- Custom User Text -->
        ${textElement}
        
        <!-- Inner shadow / glass gloss reflection -->
        <rect x="4" y="4" width="92" height="132" rx="14" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.15" />
        
        <!-- Gloss Shine Diagonal (gives 3D depth) -->
        <path d="M 4 4 L 96 100 L 96 136 Z" fill="#ffffff" opacity="0.03" clip-path="url(#caseInnerClip)" />
        <path d="M 4 4 L 50 4 L 4 60 Z" fill="#ffffff" opacity="0.05" clip-path="url(#caseInnerClip)" />
        
        <!-- Camera Cutout Outer Ring -->
        ${cameraCutout}
        
        <!-- Logo Branding (subtle) -->
        <text x="50" y="125" fill="${style === 'clear' ? '#1c1c1e' : '#ffffff'}" font-family="'DM Serif Display', Georgia, serif" font-size="2.5px" font-style="italic" opacity="0.45" text-anchor="middle" letter-spacing="0.5">By jeje.</text>
      </svg>
    `;
  }

  // Initial Seed Data (prices in EGP)
  const DEFAULT_PRODUCTS = [
    {
      id: 'p1',
      name: 'Aura Holographic Clear Case',
      description: 'Stunning light-catching holographic finish that shifts colors in different angles. Made with shock-absorbing TPU bumpers and dual-layer scratch resistance. Premium MagSafe support included.',
      price: 1200.00,
      discountPrice: null,
      category: 'iPhone',
      style: 'clear',
      color: '#fffebf',
      isFeatured: true,
      stock: 45,
      isVisible: true,
      rating: 4.8,
      reviews: 142,
      details: {
        material: 'Premium TPU & Scratch-resistant Polycarbonate',
        thickness: '1.2mm slim profile',
        protection: '8ft drop certified',
        wireless: 'Fully compatible with MagSafe & Qi charging'
      }
    },
    {
      id: 'p2',
      name: 'Stealth Carbon Fiber Case',
      description: 'Engineered for minimalism. Features high-grade matte carbon fiber weave textures that repel fingerprints and grease. Extremely lightweight yet highly rigid and protective.',
      price: 1400.00,
      discountPrice: 1199.00,
      category: 'iPhone',
      style: 'matte',
      color: '#1c1c1e',
      isFeatured: true,
      stock: 12,
      isVisible: true,
      rating: 4.9,
      reviews: 218,
      details: {
        material: 'Aramid Fiber & Matte Protective Coating',
        thickness: '0.9mm ultra-slim profile',
        protection: '6ft drop certified',
        wireless: 'MagSafe compatible'
      }
    },
    {
      id: 'p3',
      name: 'Monarch Rose Marble Case',
      description: 'Elegant white marble print embedded with gorgeous metallic rose-gold leaf veins. Offers a smooth gloss finish that does not yellow or fade over time. Designed for luxury enthusiasts.',
      price: 1600.00,
      discountPrice: null,
      category: 'iPhone',
      style: 'marble',
      color: '#ec81b5',
      isFeatured: true,
      stock: 4, 
      isVisible: true,
      rating: 4.7,
      reviews: 95,
      details: {
        material: 'Dual-layer Impact Gel & Gloss Finish Polycarbonate',
        thickness: '1.5mm protective profile',
        protection: '10ft military-grade drop tested',
        wireless: 'Qi charging compatible'
      }
    },
    {
      id: 'p4',
      name: 'Classic Pebbled Berry Leather Case',
      description: 'Crafted with premium full-grain French leather that develops a beautiful unique patina over time. Inner lined with soft microfiber velvet to protect your phone glass from dust scratches.',
      price: 1800.00,
      discountPrice: null,
      category: 'iPhone',
      style: 'leather',
      color: '#9e3660',
      isFeatured: false,
      stock: 25,
      isVisible: true,
      rating: 4.6,
      reviews: 78,
      details: {
        material: 'Full-Grain French Leather & Microfiber lining',
        thickness: '1.4mm classic profile',
        protection: '6ft drop certified',
        wireless: 'MagSafe compatible'
      }
    },
    {
      id: 'p5',
      name: 'Nordic Walnut Wood Case',
      description: 'Experience nature in your hand. Made from authentic, sustainably sourced American walnut wood veneer, fused to a strong textured black rubber protective chassis for maximum corner grip.',
      price: 1750.00,
      discountPrice: 1500.00,
      category: 'Samsung',
      style: 'wood',
      color: '#855845',
      isFeatured: true,
      stock: 18,
      isVisible: true,
      rating: 4.8,
      reviews: 62,
      details: {
        material: 'Real Natural Walnut Wood Veneer & Grippy TPU Bumper',
        thickness: '1.6mm rugged profile',
        protection: '10ft drop certified',
        wireless: 'Qi wireless charging compatible'
      }
    },
    {
      id: 'p6',
      name: 'Sunset Neon Gradient Case',
      description: 'A vibrant blend of translucent neon pink, orange, and purple hues that illuminate when backlit. Perfect for adding a bright color burst to your Samsung S-series smartphone.',
      price: 1100.00,
      discountPrice: 950.00,
      category: 'Samsung',
      style: 'gradient',
      color: '#ec81b5',
      isFeatured: false,
      stock: 30,
      isVisible: true,
      rating: 4.5,
      reviews: 110,
      details: {
        material: 'Translucent Flexible Gel TPU',
        thickness: '1.1mm slim profile',
        protection: '5ft standard protection',
        wireless: 'Qi charging compatible'
      }
    },
    {
      id: 'p7',
      name: 'Cyberpunk Rose Grid Case',
      description: 'Inspired by retro-futurism. Matte black shell mapped with neon glowing pink vector grid designs and circuits. Dynamic aesthetic built for gamers and tech enthusiasts.',
      price: 1200.00,
      discountPrice: null,
      category: 'Pixel',
      style: 'cyberpunk',
      color: '#ec81b5',
      isFeatured: false,
      stock: 22,
      isVisible: true,
      rating: 4.7,
      reviews: 43,
      details: {
        material: 'Impact Resistant Polycarbonate & Silicone Edge Grip',
        thickness: '1.3mm armor profile',
        protection: '8ft drop certified',
        wireless: 'Fully wireless compatible'
      }
    },
    {
      id: 'p8',
      name: 'Chic Plum Pebbled Leather Case',
      description: 'Rich dark plum leather phone case with luxury pebbled grain texture. Fitted with brushed anodized metallic camera ring trim and button caps for a stunning premium finish.',
      price: 1800.00,
      discountPrice: null,
      category: 'Pixel',
      style: 'leather',
      color: '#5b1f3c',
      isFeatured: true,
      stock: 15,
      isVisible: true,
      rating: 4.9,
      reviews: 84,
      details: {
        material: 'Full-Grain Pebbled Leather & Anodized Aluminum Buttons',
        thickness: '1.4mm classic profile',
        protection: '6ft drop certified',
        wireless: 'Wireless charging compatible'
      }
    }
  ];

  const DEFAULT_ORDERS = [
    {
      id: 'ORD-1082',
      customerName: 'Mariam Mansour',
      email: 'mariam.m@eg-mail.com',
      phone: '+20 102 345 6789',
      shippingAddress: '15 El-Gezira Street, Zamalek, Cairo, Egypt',
      date: '2026-07-14T14:32:00Z',
      items: [
        {
          cartId: 'p1-iPhone15Pro',
          productId: 'p1',
          name: 'Aura Holographic Clear Case',
          price: 1200.00,
          quantity: 1,
          caseSVG: getCaseSVG({ style: 'clear', color: '#fffebf', phoneModel: 'iPhone 15 Pro' }),
          phoneModel: 'iPhone 15 Pro'
        },
        {
          cartId: 'p3-iPhone15Pro',
          productId: 'p3',
          name: 'Monarch Rose Marble Case',
          price: 1600.00,
          quantity: 1,
          caseSVG: getCaseSVG({ style: 'marble', color: '#ec81b5', phoneModel: 'iPhone 15 Pro' }),
          phoneModel: 'iPhone 15 Pro'
        }
      ],
      subtotal: 2800.00,
      discount: 0,
      total: 2800.00,
      depositAmount: 280.00,
      status: 'Pending Verification',
      screenshot: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%231f1b1c; font-family:sans-serif; color:white;"><rect width="300" height="200" fill="%231f1b1c"/><text x="150" y="80" fill="%23ec81b5" font-size="18" font-weight="bold" text-anchor="middle">InstaPay Egypt</text><text x="150" y="110" fill="%23e2cbd4" font-size="12" text-anchor="middle">Reference: ORD-1082</text><text x="150" y="130" fill="%23e2cbd4" font-size="12" text-anchor="middle">Amount: 280.00 EGP</text><text x="150" y="160" fill="%23fffebf" font-size="10" text-anchor="middle">Status: Instantly Transferred</text></svg>',
      notes: 'Customer transferred 280 EGP deposit via InstaPay.'
    },
    {
      id: 'ORD-1081',
      customerName: 'Omar Shalan',
      email: 'omar.sh@eg-mail.com',
      phone: '+20 122 876 5432',
      shippingAddress: 'Block 4, 90th Street, Fifth Settlement, New Cairo, Egypt',
      date: '2026-07-13T09:15:00Z',
      items: [
        {
          cartId: 'p2-iPhone15Pro',
          productId: 'p2',
          name: 'Stealth Carbon Fiber Case',
          price: 1199.00,
          quantity: 1,
          caseSVG: getCaseSVG({ style: 'matte', color: '#1c1c1e', phoneModel: 'iPhone 15 Pro' }),
          phoneModel: 'iPhone 15 Pro'
        }
      ],
      subtotal: 1199.00,
      discount: 119.90, // 10% coupon used
      total: 1079.10,
      depositAmount: 107.91,
      status: 'Confirmed',
      screenshot: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%231f1b1c; font-family:sans-serif;"><rect width="300" height="200" fill="%231f1b1c"/><text x="150" y="80" fill="%23ec81b5" font-size="18" font-weight="bold" text-anchor="middle">InstaPay Egypt</text><text x="150" y="110" fill="%23e2cbd4" font-size="12" text-anchor="middle">Reference: ORD-1081</text><text x="150" y="130" fill="%23e2cbd4" font-size="12" text-anchor="middle">Amount: 107.91 EGP</text><text x="150" y="160" fill="%23fffebf" font-size="10" text-anchor="middle">Status: Verified Approved</text></svg>',
      notes: 'InstaPay deposit received. Package sent to packaging atelier Cairo.'
    },
    {
      id: 'ORD-1080',
      customerName: 'Farida El-Gamil',
      email: 'farida@eg-mail.com',
      phone: '+20 155 443 8822',
      shippingAddress: '42 Fouad Street, Alexandria, Egypt',
      date: '2026-07-12T17:40:00Z',
      items: [
        {
          cartId: 'custom-123',
          name: 'Custom Phone Case (iPhone 15 Pro)',
          price: 1500.00,
          quantity: 1,
          caseSVG: getCaseSVG({ style: 'gradient', color: '#ec81b5', customText: 'JEJE', customTextColor: '#ffffff', customTextFont: 'modern', phoneModel: 'iPhone 15 Pro' }),
          phoneModel: 'iPhone 15 Pro'
        }
      ],
      subtotal: 1500.00,
      discount: 0,
      total: 1500.00,
      depositAmount: 150.00,
      status: 'Payment Rejected',
      screenshot: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%231f1b1c; font-family:sans-serif;"><rect width="300" height="200" fill="%231f1b1c"/><text x="150" y="80" fill="%23ef4444" font-size="18" font-weight="bold" text-anchor="middle">InstaPay Failed Transfer</text><text x="150" y="110" fill="%23e2cbd4" font-size="12" text-anchor="middle">Reference: ORD-1080</text><text x="150" y="130" fill="%23e2cbd4" font-size="12" text-anchor="middle">Amount: 5.00 EGP</text><text x="150" y="160" fill="%23fffebf" font-size="10" text-anchor="middle">Incorrect deposit amount transferred.</text></svg>',
      notes: 'InstaPay receipt screenshot showed transfer of only 5 EGP instead of 150 EGP. Rejected.'
    }
  ];

  // Helper functions for LocalStorage
  function getStorageItem(key, defaultValue) {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error parsing localStorage key: ${key}`, e);
      return defaultValue;
    }
  }

  function setStorageItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Initialize DB with seed data if not present
  function initDB(forceReset = false) {
    if (forceReset || !localStorage.getItem('luxeshell_products')) {
      setStorageItem('luxeshell_products', DEFAULT_PRODUCTS);
      setStorageItem('luxeshell_orders', DEFAULT_ORDERS);
      setStorageItem('luxeshell_cart', []);
      setStorageItem('luxeshell_wishlist', []);
      setStorageItem('luxeshell_admin_logged', false);
      setStorageItem('luxeshell_theme', 'light'); // Default to light mode for the soft buttercream background
      console.log('By jeje. Database initialized with Egyptian EGP mock data.');
    }
  }

  // CRUD for Products
  const products = {
    getAll: () => getStorageItem('luxeshell_products', DEFAULT_PRODUCTS),
    getById: (id) => products.getAll().find(p => p.id === id),
    save: (product) => {
      const all = products.getAll();
      const idx = all.findIndex(p => p.id === product.id);
      if (idx > -1) {
        all[idx] = product;
      } else {
        all.push(product);
      }
      setStorageItem('luxeshell_products', all);
      return product;
    },
    delete: (id) => {
      const all = products.getAll().filter(p => p.id !== id);
      setStorageItem('luxeshell_products', all);
    }
  };

  // CRUD for Orders
  const orders = {
    getAll: () => getStorageItem('luxeshell_orders', DEFAULT_ORDERS),
    getById: (id) => orders.getAll().find(o => o.id === id),
    save: (order) => {
      const all = orders.getAll();
      const idx = all.findIndex(o => o.id === order.id);
      if (idx > -1) {
        all[idx] = order;
      } else {
        all.unshift(order); // Newest orders first
      }
      setStorageItem('luxeshell_orders', all);
      return order;
    },
    delete: (id) => {
      const all = orders.getAll().filter(o => o.id !== id);
      setStorageItem('luxeshell_orders', all);
    }
  };

  // Cart & Wishlist State
  const cart = {
    get: () => getStorageItem('luxeshell_cart', []),
    set: (items) => setStorageItem('luxeshell_cart', items),
    add: (product, qty = 1, selectedModel = 'iPhone 15 Pro', customConfig = null) => {
      const items = cart.get();
      let cartId = product ? product.id : '';
      let name = '';
      let price = 0;
      let svg = '';

      if (customConfig) {
        cartId = 'custom-' + Date.now();
        name = `Custom Case (${selectedModel})`;
        price = 1500.00; // EGP baseline customizer price
        svg = getCaseSVG({ ...customConfig, phoneModel: selectedModel });
      } else {
        // Standard item rendering
        cartId = `${product.id}-${selectedModel.replace(/\s+/g, '')}`;
        name = product.name;
        price = product.discountPrice || product.price;
        svg = getCaseSVG({ style: product.style, color: product.color, phoneModel: selectedModel });
      }

      const existing = items.find(i => i.cartId === cartId);
      if (existing) {
        existing.quantity += qty;
      } else {
        items.push({
          cartId,
          productId: product ? product.id : 'custom',
          name,
          price,
          quantity: qty,
          phoneModel: selectedModel,
          caseSVG: svg,
          customConfig
        });
      }
      cart.set(items);
      return items;
    },
    remove: (cartId) => {
      const items = cart.get().filter(i => i.cartId !== cartId);
      cart.set(items);
      return items;
    },
    updateQty: (cartId, qty) => {
      const items = cart.get();
      const item = items.find(i => i.cartId === cartId);
      if (item) {
        item.quantity = Math.max(1, qty);
        cart.set(items);
      }
      return items;
    },
    clear: () => cart.set([])
  };

  const wishlist = {
    get: () => getStorageItem('luxeshell_wishlist', []),
    set: (items) => setStorageItem('luxeshell_wishlist', items),
    toggle: (product) => {
      let items = wishlist.get();
      const idx = items.findIndex(i => i.id === product.id);
      if (idx > -1) {
        items.splice(idx, 1);
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          style: product.style,
          color: product.color,
          caseSVG: getCaseSVG({ style: product.style, color: product.color, phoneModel: 'iPhone 15 Pro' })
        });
      }
      wishlist.set(items);
      return wishlist.get();
    },
    has: (id) => wishlist.get().some(i => i.id === id)
  };

  // Run initialization
  initDB(false);

  return {
    initDB,
    products,
    orders,
    cart,
    wishlist,
    getCaseSVG,
    getStorageItem,
    setStorageItem
  };
})();
