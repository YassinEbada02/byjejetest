// By jeje. SPA Application Logic
window.app = (() => {
  // Application State
  const state = {
    currentRoute: 'home',
    currentParams: {},
    activeFilters: {
      search: '',
      categories: [],
      styles: [],
      maxPrice: 2000
    },
    activeSort: 'featured',
    detailQty: 1,
    detailColor: '#1c1c1e',
    activeCustomizer: {
      style: 'clear',
      color: '#1c1c1e',
      customImage: null,
      customText: '',
      customTextColor: '#ffffff',
      customTextFont: 'modern',
      customTextSize: 20,
      customTextX: 50,
      customTextY: 75,
      customImageX: 50,
      customImageY: 45,
      customImageScale: 60
    },
    checkoutCoupon: null,
    checkoutScreenshot: null
  };

  // Predefined Coupons
  const COUPONS = {
    'JEJE10': 0.10, // 10% off
    'BYJEJE20': 0.20  // 20% off
  };

  // Initialize App
  function init() {
    // Database check & seed
    LuxeData.initDB();
    
    // Set up routing
    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('load', handleRouting);

    // Initial theme check
    initTheme();

    // Bind common event listeners
    bindGlobalEvents();
    
    // Render initial badges
    updateHeaderBadges();

    // Remove loading overlay
    setTimeout(() => {
      const loader = document.getElementById('loading-overlay');
      if (loader) {
        loader.classList.add('fade-out');
      }
    }, 600);
  }

  /* -------------------------------------------------------------
     THEME MANAGEMENT
     ------------------------------------------------------------- */
  function initTheme() {
    const savedTheme = LuxeData.getStorageItem('luxeshell_theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    LuxeData.setStorageItem('luxeshell_theme', next);
    updateThemeIcon(next);
    showToast(`Theme switched to ${next} mode`, 'info');
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    if (theme === 'light') {
      icon.setAttribute('data-lucide', 'moon');
    } else {
      icon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     SPA ROUTING
     ------------------------------------------------------------- */
  function handleRouting() {
    const hash = window.location.hash || '#home';
    const parts = hash.slice(1).split('/');
    const route = parts[0];
    const param = parts[1] || null;

    state.currentRoute = route;
    state.currentParams = { id: param };

    // Toggle navigation item highlights
    document.querySelectorAll('.nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${route}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile menu if active
    const navMenu = document.getElementById('nav-menu');
    if (navMenu && navMenu.classList.contains('active')) {
      toggleMobileMenu();
    }

    // Load page containers
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`page-${route}`);
    if (targetView) {
      targetView.classList.add('active');
      window.scrollTo(0, 0);

      // Page-specific initializers
      if (route === 'home') renderHome();
      else if (route === 'shop') renderShop();
      else if (route === 'product-detail' && param) renderProductDetail(param);
      else if (route === 'customize') renderCustomize();
      else if (route === 'cart') renderCart();
      else if (route === 'wishlist') renderWishlist();
      else if (route === 'checkout') renderCheckout();
      else if (route === 'order-tracking' && param) renderOrderTracking(param);
      else if (route === 'admin') window.adminDashboard.init();
    } else {
      // Fallback
      window.location.hash = '#home';
    }
  }

  function toggleMobileMenu() {
    const menu = document.getElementById('nav-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!menu || !icon) return;

    menu.classList.toggle('active');
    const isActive = menu.classList.contains('active');
    icon.setAttribute('data-lucide', isActive ? 'x' : 'menu');
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     TOASTS & CUSTOM DIALOGS
     ------------------------------------------------------------- */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Slide in & trigger slide-out dismiss
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
  }

  function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const messageEl = document.getElementById('confirm-modal-message');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    const confirmBtn = document.getElementById('confirm-modal-confirm');

    if (!modal || !titleEl || !messageEl || !cancelBtn || !confirmBtn) return;

    titleEl.textContent = title;
    messageEl.textContent = message;

    modal.classList.add('active');

    // Remove old listeners by cloning buttons
    const newCancel = cancelBtn.cloneNode(true);
    const newConfirm = confirmBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

    newCancel.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    newConfirm.addEventListener('click', () => {
      modal.classList.remove('active');
      if (onConfirm) onConfirm();
    });
  }

  /* -------------------------------------------------------------
     STATE SYNC BADGES
     ------------------------------------------------------------- */
  function updateHeaderBadges() {
    const cartCount = LuxeData.cart.get().reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = LuxeData.wishlist.get().length;

    const cartBadge = document.getElementById('cart-badge-count');
    const wishlistBadge = document.getElementById('wishlist-badge-count');

    if (cartBadge) cartBadge.textContent = cartCount;
    if (wishlistBadge) wishlistBadge.textContent = wishlistCount;
  }

  /* -------------------------------------------------------------
     GLOBAL COMMON EVENTS
     ------------------------------------------------------------- */
  function bindGlobalEvents() {
    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) mobileBtn.addEventListener('click', toggleMobileMenu);

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Header Search box toggle
    const searchToggle = document.getElementById('search-toggle-btn');
    const searchBar = document.getElementById('search-overlay-bar');
    const searchClose = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('header-search-input');

    if (searchToggle && searchBar && searchClose) {
      searchToggle.addEventListener('click', () => {
        searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
        if (searchBar.style.display === 'block') {
          searchInput.focus();
        }
      });
      searchClose.addEventListener('click', () => {
        searchBar.style.display = 'none';
        searchInput.value = '';
      });
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const val = searchInput.value.trim();
          if (val) {
            state.activeFilters.search = val;
            searchBar.style.display = 'none';
            window.location.hash = '#shop';
            const shopSearch = document.getElementById('shop-search-input');
            if (shopSearch) shopSearch.value = val;
            renderShop();
          }
        }
      });
    }

    // Reset database button
    const globalResetBtn = document.getElementById('global-reset-demo-btn');
    if (globalResetBtn) {
      globalResetBtn.addEventListener('click', () => {
        showConfirmModal(
          'Reset Data',
          'Are you sure you want to reset all products, orders, cart, and admin status to the default demo state? Your current local data will be overwritten.',
          () => {
            LuxeData.initDB(true);
            updateHeaderBadges();
            handleRouting();
            showToast('Atelier database successfully re-seeded!', 'success');
          }
        );
      });
    }

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Scroll header blur styling
    const header = document.getElementById('main-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }
  }

  /* -------------------------------------------------------------
     PAGE: HOME
     ------------------------------------------------------------- */
  function renderHome() {
    // 1. Draw SVG mockup in hero
    const heroShowcase = document.getElementById('hero-phone-mockup');
    if (heroShowcase) {
      heroShowcase.innerHTML = LuxeData.getCaseSVG({
        style: 'gradient',
        color: '#ec81b5',
        customText: 'JEJE',
        customTextColor: '#ffffff',
        customTextFont: 'serif',
        customTextY: 72,
        customTextSize: 18,
        phoneModel: 'iPhone 15 Pro'
      });
    }

    // 2. Render Featured products
    const featuredGrid = document.getElementById('featured-product-grid');
    if (featuredGrid) {
      const featured = LuxeData.products.getAll().filter(p => p.isFeatured && p.isVisible);
      featuredGrid.innerHTML = featured.map(p => createProductCardHTML(p)).join('');
      bindProductCardEvents(featuredGrid);
    }

    // 3. Render CTA interactive cases
    const ctaCases = document.getElementById('cta-interactive-cases');
    if (ctaCases) {
      ctaCases.innerHTML = `
        <div style="width:130px;">
          ${LuxeData.getCaseSVG({ style: 'marble', color: '#ec81b5', phoneModel: 'iPhone 15 Pro' })}
        </div>
        <div style="width:130px;">
          ${LuxeData.getCaseSVG({ style: 'clear', color: '#fffebf', phoneModel: 'iPhone 15 Pro', customText: 'By jeje.', customTextColor: '#2a2527', customTextY: 75, customTextFont: 'serif' })}
        </div>
        <div style="width:130px; display:none; @media(min-width:480px){display:block;}">
          ${LuxeData.getCaseSVG({ style: 'wood', color: '#855845', phoneModel: 'Samsung Galaxy S24 Ultra' })}
        </div>
      `;
    }
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     PRODUCT CARD RENDERER
     ------------------------------------------------------------- */
  function createProductCardHTML(p) {
    const isFeaturedBadge = p.isFeatured ? `<span class="badge badge-gold product-badge">Featured</span>` : '';
    const isDiscount = p.discountPrice !== null;
    const finalPrice = isDiscount ? p.discountPrice : p.price;
    const displayPrice = isDiscount 
      ? `${finalPrice.toFixed(0)} EGP <span class="old-price">${p.price.toFixed(0)} EGP</span>` 
      : `${p.price.toFixed(0)} EGP`;

    const isWish = LuxeData.wishlist.has(p.id) ? 'active' : '';

    // Render case layout based on product properties
    const caseSVG = LuxeData.getCaseSVG({ style: p.style, color: p.color, phoneModel: 'iPhone 15 Pro' });

    return `
      <div class="product-card glass" data-id="${p.id}">
        <div class="product-image-container">
          ${isFeaturedBadge}
          <button class="wishlist-btn ${isWish}" data-id="${p.id}" aria-label="Add to wishlist"><i data-lucide="heart"></i></button>
          <a href="#product-detail/${p.id}" style="display:block; width:100%; height:100%; display:flex; justify-content:center;">
            ${caseSVG}
          </a>
        </div>
        <div class="product-info">
          <div class="product-cat">${p.category} Series</div>
          <h3 class="product-name"><a href="#product-detail/${p.id}">${p.name}</a></h3>
          <div class="product-rating">
            <span>★</span> <span>${p.rating}</span> <span>(${p.reviews})</span>
          </div>
          <div class="product-price-row">
            <div class="price-tag">${displayPrice}</div>
            <button class="add-to-cart-btn quick-cart-btn" data-id="${p.id}" aria-label="Quick Add to Cart">
              <i data-lucide="plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function bindProductCardEvents(container) {
    // 1. Quick Cart Add
    container.querySelectorAll('.quick-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const product = LuxeData.products.getById(id);
        if (product) {
          if (product.stock <= 0) {
            showToast('Out of stock!', 'error');
            return;
          }
          LuxeData.cart.add(product, 1, 'iPhone 15 Pro');
          product.stock--;
          LuxeData.products.save(product);
          updateHeaderBadges();
          showToast(`${product.name} added to cart bag`, 'success');
        }
      });
    });

    // 2. Wishlist toggle
    container.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const product = LuxeData.products.getById(id);
        if (product) {
          const list = LuxeData.wishlist.toggle(product);
          btn.classList.toggle('active');
          updateHeaderBadges();
          const isWish = list.some(i => i.id === product.id);
          showToast(isWish ? 'Added to wishlist' : 'Removed from wishlist', isWish ? 'success' : 'info');
        }
      });
    });
  }

  /* -------------------------------------------------------------
     PAGE: SHOP & FILTERING
     ------------------------------------------------------------- */
  function renderShop() {
    const searchInput = document.getElementById('shop-search-input');
    const priceSlider = document.getElementById('price-filter-slider');
    const priceVal = document.getElementById('price-slider-value');
    const sortSelect = document.getElementById('shop-sort-select');

    // 1. Sync search input value from state
    if (searchInput) {
      searchInput.value = state.activeFilters.search;
      searchInput.addEventListener('input', () => {
        state.activeFilters.search = searchInput.value;
        filterAndRenderShopProducts();
      });
    }

    // 2. Price slider
    if (priceSlider && priceVal) {
      priceSlider.value = state.activeFilters.maxPrice;
      priceVal.textContent = `${state.activeFilters.maxPrice} EGP`;
      priceSlider.addEventListener('input', () => {
        state.activeFilters.maxPrice = parseFloat(priceSlider.value);
        priceVal.textContent = `${priceSlider.value} EGP`;
        filterAndRenderShopProducts();
      });
    }

    // 3. Sorting
    if (sortSelect) {
      sortSelect.value = state.activeSort;
      sortSelect.addEventListener('change', () => {
        state.activeSort = sortSelect.value;
        filterAndRenderShopProducts();
      });
    }

    // 4. Bind checkboxes
    document.querySelectorAll('.category-checkbox-filter').forEach(cb => {
      cb.checked = state.activeFilters.categories.includes(cb.value);
      cb.addEventListener('change', () => {
        if (cb.checked) {
          state.activeFilters.categories.push(cb.value);
        } else {
          state.activeFilters.categories = state.activeFilters.categories.filter(c => c !== cb.value);
        }
        filterAndRenderShopProducts();
      });
    });

    document.querySelectorAll('.style-checkbox-filter').forEach(cb => {
      cb.checked = state.activeFilters.styles.includes(cb.value);
      cb.addEventListener('change', () => {
        if (cb.checked) {
          state.activeFilters.styles.push(cb.value);
        } else {
          state.activeFilters.styles = state.activeFilters.styles.filter(s => s !== cb.value);
        }
        filterAndRenderShopProducts();
      });
    });

    // Reset button
    const resetBtn = document.getElementById('reset-filters-btn');
    const emptyResetBtn = document.getElementById('empty-state-reset-btn');
    const clearFn = () => {
      state.activeFilters = { search: '', categories: [], styles: [], maxPrice: 2000 };
      if (searchInput) searchInput.value = '';
      if (priceSlider) {
        priceSlider.value = 2000;
        priceVal.textContent = '2000 EGP';
      }
      document.querySelectorAll('.category-checkbox-filter').forEach(cb => cb.checked = false);
      document.querySelectorAll('.style-checkbox-filter').forEach(cb => cb.checked = false);
      filterAndRenderShopProducts();
      showToast('Filters cleared', 'info');
    };
    if (resetBtn) resetBtn.addEventListener('click', clearFn);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', clearFn);

    // Initial render
    filterAndRenderShopProducts();
  }

  function filterAndRenderShopProducts() {
    let list = LuxeData.products.getAll().filter(p => p.isVisible);

    // Search query filter
    if (state.activeFilters.search) {
      const q = state.activeFilters.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    // Categories filter
    if (state.activeFilters.categories.length > 0) {
      list = list.filter(p => state.activeFilters.categories.includes(p.category));
    }

    // Styles filter
    if (state.activeFilters.styles.length > 0) {
      list = list.filter(p => state.activeFilters.styles.includes(p.style));
    }

    // Price range filter
    list = list.filter(p => {
      const finalPrice = p.discountPrice || p.price;
      return finalPrice <= state.activeFilters.maxPrice;
    });

    // Sorting
    if (state.activeSort === 'price-asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (state.activeSort === 'price-desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (state.activeSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // featured
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    // Render results
    const grid = document.getElementById('shop-product-grid');
    const countEl = document.getElementById('shop-results-count');
    const emptyState = document.getElementById('shop-empty-state');

    if (grid && countEl && emptyState) {
      countEl.textContent = `Showing ${list.length} cases`;
      
      if (list.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        grid.innerHTML = list.map(p => createProductCardHTML(p)).join('');
        bindProductCardEvents(grid);
      }
    }
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     PAGE: PRODUCT DETAIL & ZOOM
     ------------------------------------------------------------- */
  function renderProductDetail(id) {
    const product = LuxeData.products.getById(id);
    if (!product) {
      window.location.hash = '#shop';
      return;
    }

    // Reset detail parameters
    state.detailQty = 1;
    state.detailColor = product.color;

    // Load static values
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-category').textContent = `${product.category} Protective Case`;
    document.getElementById('detail-description').textContent = product.description;
    
    // Rating
    document.getElementById('detail-rating-value').textContent = product.rating;
    document.getElementById('detail-reviews-count').textContent = `(${product.reviews} reviews)`;
    let stars = '';
    const roundedStars = Math.round(product.rating);
    for (let i = 1; i <= 5; i++) {
      stars += i <= roundedStars ? '★' : '☆';
    }
    document.getElementById('detail-rating-stars').textContent = stars;

    // Price
    const detailPriceBox = document.getElementById('detail-price-box');
    const isDiscount = product.discountPrice !== null;
    const finalPrice = isDiscount ? product.discountPrice : product.price;
    detailPriceBox.innerHTML = isDiscount 
      ? `${finalPrice.toFixed(0)} EGP <span class="old-price">${product.price.toFixed(0)} EGP</span>` 
      : `${product.price.toFixed(0)} EGP`;

    // Specs
    document.getElementById('spec-material').textContent = product.details.material;
    document.getElementById('spec-thickness').textContent = product.details.thickness;
    document.getElementById('spec-protection').textContent = product.details.protection;
    document.getElementById('spec-wireless').textContent = product.details.wireless;

    // Stock
    const stockBadge = document.getElementById('detail-stock-badge');
    const stockUnits = document.getElementById('detail-stock-units');
    if (product.stock > 0) {
      stockBadge.textContent = 'In Stock';
      stockBadge.className = 'badge badge-success';
      stockUnits.textContent = `${product.stock} cases left in stock`;
    } else {
      stockBadge.textContent = 'Sold Out';
      stockBadge.className = 'badge badge-danger';
      stockUnits.textContent = 'Out of Stock - Restocking soon';
    }

    // Render Preview
    const svgTarget = document.getElementById('detail-case-svg-container');
    const deviceSelect = document.getElementById('detail-device-select');

    function updateDetailPreview() {
      const phoneModel = deviceSelect.value;
      if (svgTarget) {
        svgTarget.innerHTML = LuxeData.getCaseSVG({
          style: product.style,
          color: state.detailColor,
          phoneModel: phoneModel
        });
      }
    }

    deviceSelect.addEventListener('change', updateDetailPreview);

    // Color Swatches
    const colorsContainer = document.getElementById('detail-colors-container');
    const colorsList = ['#1c1c1e', '#ec81b5', '#1a365d', '#1c3d27', '#cc2b2b', '#7c3aed'];
    if (colorsContainer) {
      colorsContainer.innerHTML = colorsList.map(c => `
        <div class="color-swatch ${c === state.detailColor ? 'active' : ''}" data-color="${c}">
          <span style="background: ${c};"></span>
        </div>
      `).join('');

      colorsContainer.querySelectorAll('.color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
          colorsContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          sw.classList.add('active');
          state.detailColor = sw.getAttribute('data-color');
          updateDetailPreview();
        });
      });
    }

    // Thumbs
    const thumbsContainer = document.getElementById('product-detail-thumbs');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = `
        <div class="active" data-angle="back">
          <i data-lucide="smartphone" style="width:24px; height:24px;"></i>
        </div>
        <div data-angle="side" title="Side bumper view">
          <i data-lucide="layers" style="width:24px; height:24px;"></i>
        </div>
      `;
      thumbsContainer.querySelectorAll('div').forEach(thumb => {
        thumb.addEventListener('click', () => {
          thumbsContainer.querySelectorAll('div').forEach(d => d.classList.remove('active'));
          thumb.classList.add('active');
          const angle = thumb.getAttribute('data-angle');
          if (angle === 'side') {
            showToast('Side view mock: bumper has reinforced shock corners and metal custom button caps.', 'info');
          } else {
            updateDetailPreview();
          }
        });
      });
    }

    // Qty adjustments
    const qtyInput = document.getElementById('detail-qty-input');
    qtyInput.value = state.detailQty;

    const minusBtn = document.getElementById('detail-qty-minus');
    const plusBtn = document.getElementById('detail-qty-plus');

    minusBtn.onclick = () => {
      if (state.detailQty > 1) {
        state.detailQty--;
        qtyInput.value = state.detailQty;
      }
    };
    plusBtn.onclick = () => {
      if (state.detailQty < product.stock) {
        state.detailQty++;
        qtyInput.value = state.detailQty;
      } else {
        showToast('Cannot purchase more than available stock reserves', 'error');
      }
    };

    // Add to cart button
    const addCartBtn = document.getElementById('detail-add-to-cart-btn');
    addCartBtn.onclick = () => {
      if (product.stock <= 0) {
        showToast('Item sold out!', 'error');
        return;
      }
      LuxeData.cart.add(product, state.detailQty, deviceSelect.value);
      // Deduct stock in DB
      product.stock -= state.detailQty;
      LuxeData.products.save(product);
      updateHeaderBadges();
      showToast(`${state.detailQty} x ${product.name} added to cart bag`, 'success');
      window.location.hash = '#cart';
    };

    // Wishlist Button
    const wishBtn = document.getElementById('detail-wishlist-btn');
    if (wishBtn) {
      const syncWishState = () => {
        if (LuxeData.wishlist.has(product.id)) {
          wishBtn.querySelector('i').setAttribute('fill', '#ef4444');
          wishBtn.querySelector('i').style.color = '#ef4444';
        } else {
          wishBtn.querySelector('i').removeAttribute('fill');
          wishBtn.querySelector('i').style.color = 'inherit';
        }
        lucide.createIcons();
      };
      syncWishState();
      
      wishBtn.onclick = () => {
        LuxeData.wishlist.toggle(product);
        syncWishState();
        updateHeaderBadges();
      };
    }

    // Initialize SVG Preview
    updateDetailPreview();

    // Zoom Hover Effect
    const mainImgBox = document.getElementById('product-detail-main-img-box');
    if (mainImgBox) {
      mainImgBox.addEventListener('mousemove', (e) => {
        const rect = mainImgBox.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const svgElement = svgTarget.querySelector('svg');
        if (svgElement) {
          svgElement.style.transformOrigin = `${x}% ${y}%`;
          svgElement.style.transform = 'scale(1.5)';
        }
      });

      mainImgBox.addEventListener('mouseleave', () => {
        const svgElement = svgTarget.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = 'scale(1)';
        }
      });
    }

    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     PAGE: CUSTOMIZER
     ------------------------------------------------------------- */
  function renderCustomize() {
    const previewContainer = document.getElementById('custom-case-render-target');
    const modelSelect = document.getElementById('customizer-model');
    const textInput = document.getElementById('custom-text-input');
    
    // Sliders
    const textSizeSlider = document.getElementById('custom-text-size');
    const textSizeVal = document.getElementById('text-size-val');
    const textYSlider = document.getElementById('custom-text-y');
    const textYVal = document.getElementById('text-y-val');

    const imgScaleSlider = document.getElementById('custom-img-scale');
    const imgScaleVal = document.getElementById('img-scale-val');
    const imgYSlider = document.getElementById('custom-img-y');
    const imgYVal = document.getElementById('img-y-val');
    const imgXSlider = document.getElementById('custom-img-x');
    const imgXVal = document.getElementById('img-x-val');

    // Controls wrapper
    const imgControlsWrapper = document.getElementById('customizer-image-controls');

    // Re-render Preview Canvas
    function reRenderCustomCase() {
      if (previewContainer) {
        previewContainer.innerHTML = LuxeData.getCaseSVG({
          ...state.activeCustomizer,
          phoneModel: modelSelect.value
        });
      }
    }

    // 1. Model Change
    modelSelect.addEventListener('change', reRenderCustomCase);

    // 2. Texture Styles
    document.querySelectorAll('.custom-style-option').forEach(opt => {
      opt.onclick = () => {
        document.querySelectorAll('.custom-style-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        state.activeCustomizer.style = opt.getAttribute('data-style');
        reRenderCustomCase();
      };
    });

    // Bumper Colors
    document.querySelectorAll('#customizer-color-picker-group .color-swatch').forEach(sw => {
      sw.onclick = () => {
        document.querySelectorAll('#customizer-color-picker-group .color-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        state.activeCustomizer.color = sw.getAttribute('data-color');
        reRenderCustomCase();
      };
    });

    // 3. Image Graphic Upload file reader
    const dropzone = document.getElementById('customizer-dropzone');
    const fileInput = document.getElementById('customizer-file-input');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-pink)';
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--border-color)';
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processCustomizerFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
          processCustomizerFile(fileInput.files[0]);
        }
      };
    }

    function processCustomizerFile(file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        state.activeCustomizer.customImage = e.target.result;
        imgControlsWrapper.style.display = 'flex';
        dropzone.querySelector('p').innerHTML = `File uploaded: <strong>${file.name}</strong>`;
        dropzone.querySelector('i').setAttribute('data-lucide', 'check-circle');
        dropzone.querySelector('i').style.color = 'var(--success)';
        lucide.createIcons();
        reRenderCustomCase();
        showToast('Design graphic imported successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }

    // Remove Image
    const removeImgBtn = document.getElementById('custom-img-remove-btn');
    if (removeImgBtn) {
      removeImgBtn.onclick = () => {
        state.activeCustomizer.customImage = null;
        imgControlsWrapper.style.display = 'none';
        dropzone.querySelector('p').innerHTML = 'Drag and drop image here or <strong>browse files</strong>';
        dropzone.querySelector('i').setAttribute('data-lucide', 'upload-cloud');
        dropzone.querySelector('i').style.color = 'inherit';
        fileInput.value = '';
        lucide.createIcons();
        reRenderCustomCase();
        showToast('Graphic cleared', 'info');
      };
    }

    // Image adjustment sliders
    imgScaleSlider.addEventListener('input', () => {
      state.activeCustomizer.customImageScale = parseInt(imgScaleSlider.value);
      imgScaleVal.textContent = `${imgScaleSlider.value}%`;
      reRenderCustomCase();
    });
    imgYSlider.addEventListener('input', () => {
      state.activeCustomizer.customImageY = parseInt(imgYSlider.value);
      imgYVal.textContent = `${imgYSlider.value}%`;
      reRenderCustomCase();
    });
    imgXSlider.addEventListener('input', () => {
      state.activeCustomizer.customImageX = parseInt(imgXSlider.value);
      imgXVal.textContent = `${imgXSlider.value}%`;
      reRenderCustomCase();
    });

    // 4. Monogram Text Input
    textInput.value = state.activeCustomizer.customText;
    textInput.addEventListener('input', () => {
      state.activeCustomizer.customText = textInput.value;
      reRenderCustomCase();
    });

    // Font buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCustomizer.customTextFont = btn.getAttribute('data-font');
        reRenderCustomCase();
      };
    });

    // Text color swatches
    document.querySelectorAll('.text-color-swatch').forEach(sw => {
      sw.onclick = () => {
        document.querySelectorAll('.text-color-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        state.activeCustomizer.customTextColor = sw.getAttribute('data-color');
        reRenderCustomCase();
      };
    });

    // Text size/position sliders
    textSizeSlider.addEventListener('input', () => {
      state.activeCustomizer.customTextSize = parseInt(textSizeSlider.value);
      textSizeVal.textContent = `${textSizeSlider.value}px`;
      reRenderCustomCase();
    });
    textYSlider.addEventListener('input', () => {
      state.activeCustomizer.customTextY = parseInt(textYSlider.value);
      textYVal.textContent = `${textYSlider.value}%`;
      reRenderCustomCase();
    });

    // 5. Add Custom Case to Cart
    const addCartBtn = document.getElementById('customizer-add-cart-btn');
    addCartBtn.onclick = () => {
      const model = modelSelect.value;
      const frozenConfig = JSON.parse(JSON.stringify(state.activeCustomizer));
      LuxeData.cart.add(null, 1, model, frozenConfig);
      
      updateHeaderBadges();
      showToast('Custom By jeje. case added to cart bag!', 'success');
      window.location.hash = '#cart';
    };

    // Draw initial view
    reRenderCustomCase();
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     PAGE: CART
     ------------------------------------------------------------- */
  function renderCart() {
    const items = LuxeData.cart.get();
    const activePanel = document.getElementById('cart-container-active');
    const emptyState = document.getElementById('cart-empty-state');
    const tbody = document.getElementById('cart-items-tbody');

    if (items.length === 0) {
      activePanel.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    activePanel.style.display = 'block';
    emptyState.style.display = 'none';

    tbody.innerHTML = items.map(item => {
      const isCustom = item.productId === 'custom';
      const detailLabel = isCustom ? 'Bespoke Custom Case' : `${item.phoneModel} standard fit`;
      return `
        <tr>
          <td>
            <div class="cart-item-row">
              <div class="cart-item-svg">${item.caseSVG}</div>
              <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${detailLabel}</p>
              </div>
            </div>
          </td>
          <td>${item.price.toFixed(0)} EGP</td>
          <td>
            <div class="cart-qty">
              <button class="cart-qty-btn-minus" data-id="${item.cartId}"><i data-lucide="minus" style="width:12px; height:12px;"></i></button>
              <input type="text" value="${item.quantity}" readonly aria-label="Quantity">
              <button class="cart-qty-btn-plus" data-id="${item.cartId}"><i data-lucide="plus" style="width:12px; height:12px;"></i></button>
            </div>
          </td>
          <td>${(item.price * item.quantity).toFixed(0)} EGP</td>
          <td>
            <button class="cart-remove-btn" data-id="${item.cartId}"><i data-lucide="trash-2" style="width:18px; height:18px;"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();

    // Bind quantity adjustments
    tbody.querySelectorAll('.cart-qty-btn-minus').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const itm = items.find(i => i.cartId === id);
        if (itm && itm.quantity > 1) {
          adjustProductStock(itm.productId, 1);
          LuxeData.cart.updateQty(id, itm.quantity - 1);
          renderCart();
          updateHeaderBadges();
        }
      };
    });

    tbody.querySelectorAll('.cart-qty-btn-plus').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const itm = items.find(i => i.cartId === id);
        if (itm) {
          // Check stock
          if (itm.productId !== 'custom') {
            const product = LuxeData.products.getById(itm.productId);
            if (product && product.stock <= 0) {
              showToast('No more stock reserves for this item', 'error');
              return;
            }
            adjustProductStock(itm.productId, -1);
          }
          LuxeData.cart.updateQty(id, itm.quantity + 1);
          renderCart();
          updateHeaderBadges();
        }
      };
    });

    // Remove button
    tbody.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const itm = items.find(i => i.cartId === id);
        if (itm) {
          adjustProductStock(itm.productId, itm.quantity);
          LuxeData.cart.remove(id);
          renderCart();
          updateHeaderBadges();
          showToast('Item removed from cart', 'info');
        }
      };
    });

    calculateCartPricing();
  }

  function adjustProductStock(prodId, delta) {
    if (prodId === 'custom') return;
    const p = LuxeData.products.getById(prodId);
    if (p) {
      p.stock = Math.max(0, p.stock + delta);
      LuxeData.products.save(p);
    }
  }

  function calculateCartPricing() {
    const items = LuxeData.cart.get();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discount = 0;
    const discountRow = document.getElementById('cart-summary-discount-row');
    if (state.checkoutCoupon) {
      discount = subtotal * state.checkoutCoupon.rate;
      if (discountRow) {
        discountRow.style.display = 'flex';
        document.getElementById('cart-summary-discount').textContent = `- ${discount.toFixed(0)} EGP (${state.checkoutCoupon.code})`;
      }
    } else if (discountRow) {
      discountRow.style.display = 'none';
    }

    const total = Math.max(0, subtotal - discount);

    document.getElementById('cart-summary-subtotal').textContent = `${subtotal.toFixed(0)} EGP`;
    document.getElementById('cart-summary-total').textContent = `${total.toFixed(0)} EGP`;

    // Apply Coupon
    const applyBtn = document.getElementById('promo-apply-btn');
    const couponInput = document.getElementById('promo-code-input');

    if (applyBtn && couponInput) {
      applyBtn.onclick = () => {
        const val = couponInput.value.trim().toUpperCase();
        if (COUPONS[val]) {
          state.checkoutCoupon = { code: val, rate: COUPONS[val] };
          showToast(`Promo discount code ${val} applied!`, 'success');
          renderCart();
        } else {
          showToast('Invalid or expired promo code', 'error');
        }
      };
    }
  }

  /* -------------------------------------------------------------
     PAGE: WISHLIST
     ------------------------------------------------------------- */
  function renderWishlist() {
    const list = LuxeData.wishlist.get();
    const grid = document.getElementById('wishlist-items-grid');
    const emptyState = document.getElementById('wishlist-empty-state');

    if (list.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = list.map(item => `
      <div class="product-card glass" data-id="${item.id}">
        <div class="product-image-container" style="height:250px;">
          <button class="wishlist-btn active" data-id="${item.id}"><i data-lucide="heart"></i></button>
          <a href="#product-detail/${item.id}">
            ${item.caseSVG}
          </a>
        </div>
        <div class="product-info">
          <h3 class="product-name" style="font-size:1.05rem;"><a href="#product-detail/${item.id}">${item.name}</a></h3>
          <div class="product-price-row">
            <div class="price-tag">${item.price.toFixed(0)} EGP</div>
            <a href="#product-detail/${item.id}" class="btn btn-secondary btn-sm">Configure <i data-lucide="chevron-right"></i></a>
          </div>
        </div>
      </div>
    `).join('');

    lucide.createIcons();

    // Heart toggle
    grid.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const p = LuxeData.products.getById(id);
        if (p) {
          LuxeData.wishlist.toggle(p);
          renderWishlist();
          updateHeaderBadges();
          showToast('Removed from favorites list', 'info');
        }
      });
    });
  }

  /* -------------------------------------------------------------
     PAGE: CHECKOUT & 10% DEPOSIT
     ------------------------------------------------------------- */
  function renderCheckout() {
    const items = LuxeData.cart.get();
    if (items.length === 0) {
      window.location.hash = '#cart';
      return;
    }

    // Reset screenshot upload state
    state.checkoutScreenshot = null;
    const preview = document.getElementById('checkout-screenshot-preview');
    const uploadText = document.getElementById('checkout-upload-text');
    const dropzone = document.getElementById('checkout-screenshot-dropzone');
    
    if (preview && uploadText && dropzone) {
      preview.style.display = 'none';
      preview.src = '';
      uploadText.style.display = 'block';
      dropzone.classList.remove('has-file');
    }

    // Compute pricing details
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    const discountRow = document.getElementById('checkout-summary-discount-row');
    
    if (state.checkoutCoupon) {
      discount = subtotal * state.checkoutCoupon.rate;
      if (discountRow) {
        discountRow.style.display = 'flex';
        document.getElementById('checkout-summary-discount').textContent = `- ${discount.toFixed(0)} EGP`;
      }
    } else if (discountRow) {
      discountRow.style.display = 'none';
    }

    const grandTotal = Math.max(0, subtotal - discount);
    const depositAmount = grandTotal * 0.10;

    // Set prices
    document.getElementById('checkout-summary-subtotal').textContent = `${subtotal.toFixed(0)} EGP`;
    document.getElementById('checkout-summary-total').textContent = `${grandTotal.toFixed(0)} EGP`;
    document.getElementById('checkout-calc-total').textContent = `${grandTotal.toFixed(0)} EGP`;
    document.getElementById('checkout-calc-deposit').textContent = `${depositAmount.toFixed(0)} EGP`;

    // Render Side list
    const itemsList = document.getElementById('checkout-items-list');
    if (itemsList) {
      itemsList.innerHTML = items.map(item => `
        <div style="display:flex; align-items:center; gap:1rem; background:var(--bg-tertiary); padding:0.8rem; border-radius:8px;">
          <div style="width:40px; height:50px;">${item.caseSVG}</div>
          <div style="flex:1; overflow:hidden;">
            <h4 style="font-size:0.85rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</h4>
            <p style="font-size:0.75rem; color:var(--text-secondary);">${item.phoneModel} x ${item.quantity}</p>
          </div>
          <span style="font-size:0.9rem; font-weight:600;">${(item.price * item.quantity).toFixed(0)} EGP</span>
        </div>
      `).join('');
    }

    // Uploader controls
    const fileInput = document.getElementById('checkout-screenshot-file');
    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-pink)';
      };
      dropzone.ondragleave = () => {
        dropzone.style.borderColor = 'var(--border-color)';
      };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processCheckoutReceipt(e.dataTransfer.files[0]);
        }
      };

      fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
          processCheckoutReceipt(fileInput.files[0]);
        }
      };
    }

    function processCheckoutReceipt(file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload a screenshot image of the InstaPay transfer', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        state.checkoutScreenshot = e.target.result;
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadText.style.display = 'none';
        dropzone.classList.add('has-file');
        showToast('InstaPay screenshot imported successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }

    // Place Order submission
    const placeBtn = document.getElementById('checkout-place-order-btn');
    placeBtn.onclick = () => {
      // Form fields validation
      const name = document.getElementById('checkout-name').value.trim();
      const email = document.getElementById('checkout-email').value.trim();
      const phone = document.getElementById('checkout-phone').value.trim();
      const address = document.getElementById('checkout-address').value.trim();
      const city = document.getElementById('checkout-city').value.trim();
      const zip = document.getElementById('checkout-zip').value.trim();

      if (!name || !email || !phone || !address || !city) {
        showToast('Please fill out all contact and delivery details', 'error');
        return;
      }

      if (!state.checkoutScreenshot) {
        showToast('Please upload your 10% InstaPay deposit screenshot receipt', 'error');
        return;
      }

      // Proceed creation
      const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const shippingAddress = `${address}, ${city} ${zip ? ', ZIP ' + zip : ''}, Egypt`;

      const newOrder = {
        id: orderId,
        customerName: name,
        email: email,
        phone: phone,
        shippingAddress: shippingAddress,
        date: new Date().toISOString(),
        items: items, 
        subtotal: subtotal,
        discount: discount,
        total: grandTotal,
        depositAmount: depositAmount,
        status: 'Pending Verification',
        screenshot: state.checkoutScreenshot,
        notes: 'Deposit pending InstaPay ledger audit by our finance concierge.'
      };

      LuxeData.orders.save(newOrder);
      LuxeData.cart.clear();
      updateHeaderBadges();
      state.checkoutCoupon = null;
      
      showToast('Order placed successfully! Verification pending.', 'success');
      window.location.hash = `#order-tracking/${orderId}`;
    };
  }

  /* -------------------------------------------------------------
     PAGE: ORDER TRACKING & RE-UPLOAD
     ------------------------------------------------------------- */
  function renderOrderTracking(orderId) {
    const card = document.getElementById('order-tracking-card');
    if (!card) return;

    const order = LuxeData.orders.getById(orderId);
    if (!order) {
      card.innerHTML = `
        <i data-lucide="alert-circle" style="width:48px; height:48px; color:var(--error); margin:0 auto 1.5rem auto;"></i>
        <h2>Order Not Found</h2>
        <p style="margin-bottom:1.5rem;">We couldn't retrieve order records matching <strong>${orderId}</strong>.</p>
        <a href="#shop" class="btn btn-primary">Return to Catalog</a>
      `;
      lucide.createIcons();
      return;
    }

    let statusClass = 'icon-pending';
    let statusTitle = 'Pending Verification';
    let statusDesc = 'We are verifying your 10% InstaPay deposit transfer screenshot receipt.';
    let statusIcon = 'clock';

    if (order.status === 'Confirmed') {
      statusClass = 'icon-confirmed';
      statusTitle = 'Order Confirmed';
      statusDesc = 'InstaPay deposit verified successfully! Your case designs have been sent to manufacturing production.';
      statusIcon = 'check-circle';
    } else if (order.status === 'Payment Rejected') {
      statusClass = 'icon-rejected';
      statusTitle = 'InstaPay Verification Rejected';
      statusDesc = 'We could not verify your InstaPay deposit. Please check the concierge comments below and upload another screenshot.';
      statusIcon = 'alert-triangle';
    }

    // Items table summary
    const itemsHTML = order.items.map(item => `
      <div style="display:flex; align-items:center; gap:1.2rem; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem; margin-bottom:0.8rem;">
        <div style="width:50px; height:65px;">${item.caseSVG}</div>
        <div style="flex:1;">
          <h4 style="font-weight:600; font-size:0.95rem;">${item.name}</h4>
          <p style="color:var(--text-secondary); font-size:0.8rem;">${item.phoneModel} x ${item.quantity}</p>
        </div>
        <span style="font-weight:600;">${(item.price * item.quantity).toFixed(0)} EGP</span>
      </div>
    `).join('');

    // Re-uploader if rejected
    let reuploaderHTML = '';
    if (order.status === 'Payment Rejected') {
      reuploaderHTML = `
        <div style="border-top:1px solid var(--border-color); padding-top:2rem; margin-top:2rem; text-align:left;">
          <h4 style="margin-bottom:0.8rem;"><i data-lucide="upload" style="display:inline; width:18px; height:18px; margin-right:0.5rem; vertical-align:middle;"></i> Re-upload Corrected InstaPay Screenshot</h4>
          <div class="screenshot-upload-area" id="reupload-dropzone">
            <input type="file" id="reupload-file-input" accept="image/*" style="display:none;" aria-label="Re-upload payment screenshot">
            <i data-lucide="camera" style="width: 24px; height: 24px; margin:0 auto 0.5rem auto;"></i>
            <p id="reupload-text">Drop screenshot or <strong>browse files</strong></p>
            <img src="" id="reupload-preview-img" class="screenshot-preview">
          </div>
          <button class="btn btn-primary" id="submit-reupload-btn" style="width:100%; margin-top:1.2rem;">Submit Corrected Proof</button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="order-status-header">
        <div class="order-status-icon ${statusClass}">
          <i data-lucide="${statusIcon}" style="width:36px; height:36px;"></i>
        </div>
        <h2>${statusTitle}</h2>
        <p style="max-width:520px; margin:0.5rem auto 1.5rem auto;">${statusDesc}</p>
      </div>

      <table class="status-tracker-table">
        <tr>
          <td class="label">Order ID</td>
          <td class="value">${order.id}</td>
        </tr>
        <tr>
          <td class="label">Date Submitted</td>
          <td class="value">${new Date(order.date).toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">10% Deposit Due</td>
          <td class="value" style="color:var(--accent-pink);">${order.depositAmount.toFixed(0)} EGP</td>
        </tr>
        <tr>
          <td class="label">Grand Total</td>
          <td class="value">${order.total.toFixed(0)} EGP</td>
        </tr>
        <tr>
          <td class="label">Concierge Remarks</td>
          <td class="value" style="font-style:italic; font-weight:400; color:var(--text-secondary);">${order.notes}</td>
        </tr>
      </table>

      <div style="text-align:left; margin-top:2.5rem; border-top:1px solid var(--border-color); padding-top:2rem;">
        <h3 style="margin-bottom:1rem; font-size:1.15rem;">Ordered Products</h3>
        ${itemsHTML}
      </div>

      ${reuploaderHTML}
    `;

    lucide.createIcons();

    // Bind reuploader events
    if (order.status === 'Payment Rejected') {
      const reDrop = document.getElementById('reupload-dropzone');
      const reInput = document.getElementById('reupload-file-input');
      const rePreview = document.getElementById('reupload-preview-img');
      const reTxt = document.getElementById('reupload-text');
      const reSubmit = document.getElementById('submit-reupload-btn');
      
      let tempScreenshot = null;

      if (reDrop && reInput) {
        reDrop.onclick = () => reInput.click();
        reDrop.ondragover = (e) => {
          e.preventDefault();
          reDrop.style.borderColor = 'var(--accent-pink)';
        };
        reDrop.ondragleave = () => {
          reDrop.style.borderColor = 'var(--border-color)';
        };
        reDrop.ondrop = (e) => {
          e.preventDefault();
          reDrop.style.borderColor = 'var(--border-color)';
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processReupload(e.dataTransfer.files[0]);
          }
        };
        reInput.onchange = () => {
          if (reInput.files && reInput.files[0]) {
            processReupload(reInput.files[0]);
          }
        };
      }

      function processReupload(file) {
        if (!file.type.startsWith('image/')) {
          showToast('Please upload an image receipt file', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          tempScreenshot = e.target.result;
          rePreview.src = e.target.result;
          rePreview.style.display = 'block';
          reTxt.style.display = 'none';
          reDrop.classList.add('has-file');
        };
        reader.readAsDataURL(file);
      }

      if (reSubmit) {
        reSubmit.onclick = () => {
          if (!tempScreenshot) {
            showToast('Please upload a screenshot proof of the payment', 'error');
            return;
          }
          order.screenshot = tempScreenshot;
          order.status = 'Pending Verification';
          order.notes = 'Deposit verification requested again with corrected InstaPay payment screenshot.';
          LuxeData.orders.save(order);
          showToast('Proof uploaded! Status set back to Pending Verification.', 'success');
          renderOrderTracking(orderId);
        };
      }
    }
  }

  // Self Executing Core Init
  setTimeout(init, 0);

  return {
    showToast,
    showConfirmModal,
    updateHeaderBadges,
    state
  };
})();
