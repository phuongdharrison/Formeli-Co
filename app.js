// FORMÉLI & CO. — REYKJAVÍK, ICELAND
// Main Interactive Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    theme: localStorage.getItem('formeli_theme') || 'chocolate', // 'chocolate' or 'oat'
    currency: localStorage.getItem('formeli_currency') || 'ISK',  // Default to ISK (kr)
    cart: JSON.parse(localStorage.getItem('formeli_cart') || '[]'),
    activeFilter: 'all',
    currentHeroSlide: 0,
    heroAutoPlayInterval: null,
    discountApplied: 0, // percentage
    liveProducts: null
  };

  function getCatalog() {
    return state.liveProducts || (typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : []);
  }

  // Currency Exchange Configuration
  const CURRENCY_CONFIG = {
    ISK: { symbol: '', rate: 150, suffix: ' kr', name: 'ISK (kr)' },
    EUR: { symbol: '€', rate: 1, suffix: '', name: 'EUR (€)' },
    USD: { symbol: '$', rate: 1.08, suffix: '', name: 'USD ($)' }
  };

  const FREE_SHIPPING_THRESHOLD = {
    ISK: 45000,
    EUR: 300,
    USD: 350
  };

  // DOM Elements
  const body = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const currencySelect = document.getElementById('currency-select');
  const productsGrid = document.getElementById('products-grid');
  const filterPillBtns = document.querySelectorAll('.filter-pill-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartOpenBtns = document.querySelectorAll('.open-cart-btn');
  const cartCloseBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const freeShippingText = document.getElementById('free-shipping-text');
  const freeShippingBar = document.getElementById('free-shipping-bar');
  const quickViewModal = document.getElementById('quick-view-modal');
  const quickViewBackdrop = document.getElementById('quick-view-backdrop');
  const quickViewCloseBtn = document.getElementById('close-quick-view-btn');
  const quickViewContent = document.getElementById('quick-view-modal-content');
  const toastEl = document.getElementById('luxury-toast');
  const promoInput = document.getElementById('promo-code-input');
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoFeedback = document.getElementById('promo-feedback');

  // Search Elements
  const searchModal = document.getElementById('search-modal');
  const searchBackdrop = document.getElementById('search-backdrop');
  const searchOpenBtns = document.querySelectorAll('.open-search-btn');
  const searchCloseBtn = document.getElementById('close-search-btn');
  const searchInput = document.getElementById('luxury-search-input');
  const searchResultsContainer = document.getElementById('search-results-container');

  // Hero Elements
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroIndicators = document.querySelectorAll('.hero-indicator-btn');
  const heroPrevBtn = document.getElementById('hero-prev-btn');
  const heroNextBtn = document.getElementById('hero-next-btn');

  // ==========================================================================
  // Formatting Helpers
  // ==========================================================================
  function formatPrice(eurAmount) {
    const config = CURRENCY_CONFIG[state.currency];
    const converted = Math.round(eurAmount * config.rate);
    const formattedNum = new Intl.NumberFormat(state.currency === 'ISK' ? 'is-IS' : 'en-US').format(converted);
    return `${config.symbol}${formattedNum}${config.suffix}`;
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.querySelector('.toast-text').textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3800);
  }

  // ==========================================================================
  // Theme Management
  // ==========================================================================
  function applyTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem('formeli_theme', themeName);
    if (themeName === 'oat') {
      body.setAttribute('data-theme', 'oat');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = `
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          <span class="hidden sm:inline">CHOCOLATE PALETTE</span>
        `;
      }
    } else {
      body.removeAttribute('data-theme');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = `
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span class="hidden sm:inline">WARM OAT THEME</span>
        `;
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'chocolate' ? 'oat' : 'chocolate';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme === 'chocolate' ? 'Rich Chocolate Palette' : 'Warm Oat Palette'}`);
    });
  }

  // Currency Selector
  if (currencySelect) {
    currencySelect.value = state.currency;
    currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      localStorage.setItem('formeli_currency', state.currency);
      renderProducts();
      renderCart();
      showToast(`Currency updated to ${state.currency}`);
    });
  }

  // ==========================================================================
  // Hero Slider
  // ==========================================================================
  function goToHeroSlide(index) {
    heroSlides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.remove('opacity-0', 'pointer-events-none');
        slide.classList.add('opacity-100', 'z-10');
      } else {
        slide.classList.add('opacity-0', 'pointer-events-none');
        slide.classList.remove('opacity-100', 'z-10');
      }
    });

    heroIndicators.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('border-b-2', 'font-semibold', 'opacity-100');
        btn.classList.remove('opacity-50');
      } else {
        btn.classList.remove('border-b-2', 'font-semibold', 'opacity-100');
        btn.classList.add('opacity-50');
      }
    });
    state.currentHeroSlide = index;
  }

  function startHeroAutoPlay() {
    state.heroAutoPlayInterval = setInterval(() => {
      const nextSlide = (state.currentHeroSlide + 1) % heroSlides.length;
      goToHeroSlide(nextSlide);
    }, 7000);
  }

  if (heroSlides.length > 0) {
    goToHeroSlide(0);
    startHeroAutoPlay();

    heroIndicators.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        clearInterval(state.heroAutoPlayInterval);
        const slideIndex = parseInt(btn.getAttribute('data-slide-index'), 10);
        goToHeroSlide(slideIndex);
        startHeroAutoPlay();
      });
    });

    if (heroPrevBtn) {
      heroPrevBtn.addEventListener('click', () => {
        clearInterval(state.heroAutoPlayInterval);
        const prev = (state.currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
        goToHeroSlide(prev);
        startHeroAutoPlay();
      });
    }

    if (heroNextBtn) {
      heroNextBtn.addEventListener('click', () => {
        clearInterval(state.heroAutoPlayInterval);
        const next = (state.currentHeroSlide + 1) % heroSlides.length;
        goToHeroSlide(next);
        startHeroAutoPlay();
      });
    }
  }

  // ==========================================================================
  // Product Catalog Rendering
  // ==========================================================================
  function renderProducts() {
    if (!productsGrid) return;

    const filtered = getCatalog().filter(prod => {
      if (state.activeFilter === 'all') return true;
      return prod.categoryKey === state.activeFilter;
    });

    productsGrid.innerHTML = filtered.map(product => {
      const defaultColor = product.colors[0];
      const swatchesHtml = product.colors.map((color, idx) => `
        <button 
          type="button"
          class="swatch-dot ${idx === 0 ? 'active' : ''}" 
          style="background-color: ${color.hex};"
          data-color-name="${color.name}"
          data-image="${color.image}"
          data-hover-image="${color.hoverImage}"
          data-product-id="${product.id}"
          title="${color.name}"
          aria-label="${color.name}"
        ></button>
      `).join('');

      return `
        <div class="product-card group flex flex-col" data-product-id="${product.id}">
          <div class="product-image-wrap relative rounded-sm mb-4">
            <img 
              src="${defaultColor.image}" 
              alt="${product.name} in ${defaultColor.name}" 
              class="main-img w-full h-full object-cover"
              loading="lazy"
            />
            <img 
              src="${defaultColor.hoverImage}" 
              alt="${product.name} detail" 
              class="hover-img w-full h-full object-cover"
              loading="lazy"
            />
            
            ${product.isNew ? `
              <span class="absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2 py-1 bg-primary text-primary border border-border-light backdrop-blur-md">
                NEW IN
              </span>
            ` : ''}

            <!-- Quick Add Overlay -->
            <div class="product-quick-add flex gap-2">
              <button 
                type="button" 
                class="quick-view-btn flex-1 py-2.5 px-3 text-xs tracking-wider uppercase font-medium bg-white/90 text-espresso hover:bg-white transition-luxury shadow-lg text-center"
                data-product-id="${product.id}"
              >
                Quick View
              </button>
              <button 
                type="button" 
                class="quick-add-btn px-4 py-2.5 bg-espresso text-cream hover:opacity-90 transition-luxury shadow-lg"
                data-product-id="${product.id}"
                title="Add to Bag"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex flex-col flex-1 justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-text-muted mb-1 tracking-wider uppercase">
                <span>${product.category}</span>
                <span class="product-color-label text-[11px] lowercase opacity-80">${defaultColor.name}</span>
              </div>
              <h3 class="font-serif text-lg lg:text-xl text-text-primary leading-snug group-hover:opacity-85 transition-opacity">
                ${product.name}
              </h3>
            </div>

            <div class="mt-3 flex items-center justify-between pt-2 border-t border-border-light">
              <span class="font-sans text-sm tracking-wide font-medium text-text-primary">
                ${formatPrice(product.priceEUR)}
              </span>
              <div class="flex items-center gap-1.5 swatches-wrapper">
                ${swatchesHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachProductListeners();
  }

  function attachProductListeners() {
    // Swatch clicks
    document.querySelectorAll('.swatch-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = dot.closest('.swatches-wrapper');
        const card = dot.closest('.product-card');
        const mainImg = card.querySelector('.main-img');
        const hoverImg = card.querySelector('.hover-img');
        const colorLabel = card.querySelector('.product-color-label');

        wrapper.querySelectorAll('.swatch-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');

        const newImg = dot.getAttribute('data-image');
        const newHover = dot.getAttribute('data-hover-image');
        const colorName = dot.getAttribute('data-color-name');

        if (mainImg) mainImg.src = newImg;
        if (hoverImg) hoverImg.src = newHover;
        if (colorLabel) colorLabel.textContent = colorName;
      });
    });

    // Quick View buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-product-id');
        openQuickView(prodId);
      });
    });

    // Quick Add buttons
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-product-id');
        const product = getCatalog().find(p => p.id === prodId);
        if (product) {
          const card = btn.closest('.product-card');
          const activeDot = card.querySelector('.swatch-dot.active') || card.querySelector('.swatch-dot');
          const colorName = activeDot ? activeDot.getAttribute('data-color-name') : product.colors[0].name;
          const colorObj = product.colors.find(c => c.name === colorName) || product.colors[0];
          const defaultSize = product.sizes[0];

          addToCart(product, colorObj, defaultSize, 1);
        }
      });
    });
  }

  // Filter Pills
  filterPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPillBtns.forEach(b => {
        b.classList.remove('border-text-primary', 'font-semibold');
        b.classList.add('opacity-70', 'border-transparent');
      });
      btn.classList.add('border-text-primary', 'font-semibold');
      btn.classList.remove('opacity-70', 'border-transparent');

      state.activeFilter = btn.getAttribute('data-category');
      renderProducts();
    });
  });

  // ==========================================================================
  // Quick View Modal
  // ==========================================================================
  function openQuickView(productId) {
    const product = getCatalog().find(p => p.id === productId);
    if (!product || !quickViewContent) return;

    let selectedColor = product.colors[0];
    let selectedSize = product.sizes[0];

    const swatchesHtml = product.colors.map((c, idx) => `
      <button 
        type="button" 
        class="qv-swatch swatch-dot ${idx === 0 ? 'active' : ''}" 
        style="background-color: ${c.hex};"
        data-color-name="${c.name}"
        data-image="${c.image}"
        title="${c.name}"
      ></button>
    `).join('');

    const sizesHtml = product.sizes.map((s, idx) => `
      <button 
        type="button" 
        class="qv-size-btn px-3.5 py-1.5 text-xs border ${idx === 0 ? 'border-text-primary font-semibold' : 'border-border-strong opacity-75'} hover:border-text-primary transition-colors uppercase tracking-wider"
        data-size="${s}"
      >
        ${s}
      </button>
    `).join('');

    quickViewContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-10">
        <!-- Image Stage -->
        <div class="relative bg-bg-surface overflow-hidden aspect-[3/4] rounded-sm">
          <img 
            id="qv-main-image"
            src="${selectedColor.image}" 
            alt="${product.name}" 
            class="w-full h-full object-cover transition-opacity duration-300"
          />
          <div class="absolute bottom-3 left-3 bg-bg-primary/90 backdrop-blur-md px-3 py-1 text-[11px] tracking-widest uppercase border border-border-light text-text-primary">
            Reykjavík Atelier
          </div>
        </div>

        <!-- Details Stage -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs tracking-widest uppercase text-text-muted mb-2">
              <span>${product.category}</span>
              <span>Ref. ${product.id.toUpperCase()}</span>
            </div>
            
            <h2 class="font-serif text-2xl lg:text-3xl text-text-primary mb-3">
              ${product.name}
            </h2>
            
            <div class="text-xl font-medium text-text-primary mb-4">
              ${formatPrice(product.priceEUR)}
            </div>

            <p class="text-xs lg:text-sm text-text-secondary leading-relaxed mb-6 font-light">
              ${product.tagline}
            </p>

            <!-- Color selection -->
            <div class="mb-5">
              <div class="flex items-center justify-between text-xs tracking-wider uppercase mb-2">
                <span class="text-text-muted">Color:</span>
                <span id="qv-color-text" class="text-text-primary font-medium">${selectedColor.name}</span>
              </div>
              <div class="flex gap-2" id="qv-swatches-container">
                ${swatchesHtml}
              </div>
            </div>

            <!-- Size selection -->
            <div class="mb-6">
              <div class="flex items-center justify-between text-xs tracking-wider uppercase mb-2">
                <span class="text-text-muted">Size:</span>
                <button type="button" class="text-[11px] underline text-text-secondary hover:text-text-primary">Size Guide</button>
              </div>
              <div class="flex flex-wrap gap-2" id="qv-sizes-container">
                ${sizesHtml}
              </div>
            </div>

            <!-- Composition & Care Accordion -->
            <div class="border-t border-b border-border-light py-3 space-y-2 text-xs">
              <div>
                <span class="text-text-muted uppercase tracking-wider block mb-0.5">Composition:</span>
                <span class="text-text-primary font-light">${product.composition}</span>
              </div>
              <div>
                <span class="text-text-muted uppercase tracking-wider block mb-0.5">Care:</span>
                <span class="text-text-primary font-light">${product.care}</span>
              </div>
            </div>
          </div>

          <!-- Add to Bag CTA -->
          <div class="mt-8 pt-4">
            <button 
              id="qv-add-cart-btn" 
              type="button" 
              class="btn-luxury-primary w-full py-3.5 tracking-brand text-xs font-semibold"
            >
              Add to Bag &nbsp;—&nbsp; ${formatPrice(product.priceEUR)}
            </button>
            <p class="text-center text-[10px] text-text-muted tracking-wider uppercase mt-2.5">
              Complimentary gift packaging & 30-day worldwide returns
            </p>
          </div>
        </div>
      </div>
    `;

    // Swatches within modal
    const qvSwatches = quickViewContent.querySelectorAll('.qv-swatch');
    const qvImg = quickViewContent.querySelector('#qv-main-image');
    const qvColorText = quickViewContent.querySelector('#qv-color-text');

    qvSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        qvSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const cName = swatch.getAttribute('data-color-name');
        selectedColor = product.colors.find(c => c.name === cName) || selectedColor;
        qvImg.src = swatch.getAttribute('data-image');
        qvColorText.textContent = cName;
      });
    });

    // Sizes within modal
    const sizeBtns = quickViewContent.querySelectorAll('.qv-size-btn');
    sizeBtns.forEach(sb => {
      sb.addEventListener('click', () => {
        sizeBtns.forEach(b => {
          b.classList.remove('border-text-primary', 'font-semibold');
          b.classList.add('border-border-strong', 'opacity-75');
        });
        sb.classList.add('border-text-primary', 'font-semibold');
        sb.classList.remove('border-border-strong', 'opacity-75');
        selectedSize = sb.getAttribute('data-size');
      });
    });

    // Add to cart click inside Quick View
    const qvAddBtn = quickViewContent.querySelector('#qv-add-cart-btn');
    qvAddBtn.addEventListener('click', () => {
      addToCart(product, selectedColor, selectedSize, 1);
      closeQuickView();
    });

    quickViewModal.classList.add('active');
  }

  function closeQuickView() {
    if (quickViewModal) quickViewModal.classList.remove('active');
  }

  if (quickViewCloseBtn) quickViewCloseBtn.addEventListener('click', closeQuickView);
  if (quickViewBackdrop) quickViewBackdrop.addEventListener('click', closeQuickView);

  // ==========================================================================
  // Shopping Bag / Cart Management
  // ==========================================================================
  function addToCart(product, colorObj, size, quantity = 1) {
    const existingIndex = state.cart.findIndex(item => 
      item.productId === product.id && 
      item.colorName === colorObj.name && 
      item.size === size
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: `${product.id}-${colorObj.name}-${size}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        priceEUR: product.priceEUR,
        priceISK: product.priceISK,
        priceUSD: product.priceUSD,
        colorName: colorObj.name,
        colorHex: colorObj.hex,
        image: colorObj.image,
        size: size,
        quantity: quantity
      });
    }

    saveCart();
    renderCart();
    openCartDrawer();
    showToast(`Added ${product.name} (${colorObj.name}) to your bag`);
  }

  function saveCart() {
    localStorage.setItem('formeli_cart', JSON.stringify(state.cart));
    updateCartBadges();
  }

  function updateCartBadges() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
      if (totalItems > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  }

  function renderCart() {
    if (!cartItemsContainer) return;

    if (state.cart.length === 0) {
      cartItemsContainer.classList.add('hidden');
      if (cartEmptyState) cartEmptyState.classList.remove('hidden');
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(0);
      updateFreeShippingProgress(0);
      return;
    }

    cartItemsContainer.classList.remove('hidden');
    if (cartEmptyState) cartEmptyState.classList.add('hidden');

    const totalEUR = state.cart.reduce((sum, item) => sum + (item.priceEUR * item.quantity), 0);
    const finalEUR = state.discountApplied > 0 ? totalEUR * (1 - state.discountApplied / 100) : totalEUR;

    if (cartSubtotalEl) {
      cartSubtotalEl.innerHTML = state.discountApplied > 0 
        ? `<span class="line-through text-text-muted text-xs mr-2">${formatPrice(totalEUR)}</span> ${formatPrice(finalEUR)}`
        : formatPrice(totalEUR);
    }

    updateFreeShippingProgress(finalEUR);

    cartItemsContainer.innerHTML = state.cart.map(item => `
      <div class="flex gap-4 py-4 border-b border-border-light items-center">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="w-20 h-24 object-cover bg-bg-surface rounded-sm"
        />
        
        <div class="flex-1 flex flex-col justify-between h-full">
          <div>
            <div class="flex items-start justify-between">
              <h4 class="font-serif text-sm lg:text-base text-text-primary leading-tight">
                ${item.name}
              </h4>
              <button 
                type="button" 
                class="remove-cart-item-btn text-text-muted hover:text-text-primary text-xs p-1"
                data-item-id="${item.id}"
                title="Remove item"
              >
                ✕
              </button>
            </div>
            
            <div class="text-xs text-text-muted mt-1 flex items-center gap-2">
              <span>Color: ${item.colorName}</span>
              <span>·</span>
              <span>Size: ${item.size}</span>
            </div>
          </div>

          <div class="flex items-center justify-between mt-3">
            <!-- Quantity controls -->
            <div class="flex items-center border border-border-strong text-xs">
              <button 
                type="button" 
                class="cart-qty-btn px-2.5 py-1 text-text-muted hover:text-text-primary"
                data-item-id="${item.id}" 
                data-change="-1"
              >-</button>
              <span class="px-2 font-medium">${item.quantity}</span>
              <button 
                type="button" 
                class="cart-qty-btn px-2.5 py-1 text-text-muted hover:text-text-primary"
                data-item-id="${item.id}" 
                data-change="1"
              >+</button>
            </div>

            <!-- Price -->
            <span class="text-xs font-medium text-text-primary">
              ${formatPrice(item.priceEUR * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    `).join('');

    // Attach cart item quantity and delete listeners
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        const change = parseInt(btn.getAttribute('data-change'), 10);
        updateCartQuantity(itemId, change);
      });
    });

    document.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        removeCartItem(itemId);
      });
    });
  }

  function updateFreeShippingProgress(currentEUR) {
    if (!freeShippingText || !freeShippingBar) return;
    const threshold = FREE_SHIPPING_THRESHOLD[state.currency];
    const convertedCurrent = currentEUR * CURRENCY_CONFIG[state.currency].rate;
    const remaining = Math.max(0, threshold - convertedCurrent);

    if (remaining <= 0) {
      freeShippingText.innerHTML = `✨ <strong>Complimentary Worldwide Shipping</strong> unlocked!`;
      freeShippingBar.style.width = '100%';
    } else {
      const percentage = Math.min(100, Math.round((convertedCurrent / threshold) * 100));
      const formattedRem = formatPrice(remaining / CURRENCY_CONFIG[state.currency].rate);
      freeShippingText.innerHTML = `Add <strong>${formattedRem}</strong> more to enjoy Complimentary Worldwide Express Shipping from Reykjavík.`;
      freeShippingBar.style.width = `${percentage}%`;
    }
  }

  function updateCartQuantity(itemId, change) {
    const itemIndex = state.cart.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      state.cart[itemIndex].quantity += change;
      if (state.cart[itemIndex].quantity <= 0) {
        state.cart.splice(itemIndex, 1);
      }
      saveCart();
      renderCart();
    }
  }

  function removeCartItem(itemId) {
    state.cart = state.cart.filter(i => i.id !== itemId);
    saveCart();
    renderCart();
    showToast('Item removed from your bag');
  }

  function openCartDrawer() {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.add('active');
      cartBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.remove('active');
      cartBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  cartOpenBtns.forEach(btn => btn.addEventListener('click', openCartDrawer));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  // Promo Code
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'WELCOME10' || code === 'REYKJAVIK' || code === 'QUIETLUXURY') {
        state.discountApplied = 10;
        if (promoFeedback) {
          promoFeedback.textContent = 'Code applied: 10% VIP Atelier discount!';
          promoFeedback.className = 'text-xs text-green-400 mt-1';
        }
        renderCart();
        showToast('10% VIP Atelier discount applied!');
      } else {
        if (promoFeedback) {
          promoFeedback.textContent = 'Invalid promo code. Try WELCOME10';
          promoFeedback.className = 'text-xs text-red-400 mt-1';
        }
      }
    });
  }

  // ==========================================================================
  // Live Search Drawer
  // ==========================================================================
  function openSearch() {
    if (searchModal && searchBackdrop) {
      searchModal.classList.add('active');
      searchBackdrop.classList.add('active');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 150);
      }
    }
  }

  function closeSearch() {
    if (searchModal && searchBackdrop) {
      searchModal.classList.remove('active');
      searchBackdrop.classList.remove('active');
    }
  }

  searchOpenBtns.forEach(b => b.addEventListener('click', openSearch));
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);

  if (searchInput && searchResultsContainer) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResultsContainer.innerHTML = `
          <div class="py-6 text-center text-xs text-text-muted">
            Search for cashmere coats, knitwear, tailored trousers, or Reykjavik essentials...
          </div>
        `;
        return;
      }

      const matches = getCatalog().filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResultsContainer.innerHTML = `
          <div class="py-8 text-center text-xs text-text-muted">
            No pieces found matching "${q}". Explore our <button type="button" class="underline text-text-primary" onclick="window.scrollToCategory('all')">Signature Edit</button>.
          </div>
        `;
        return;
      }

      searchResultsContainer.innerHTML = matches.map(prod => `
        <div class="flex items-center gap-3 p-2 hover:bg-bg-surface cursor-pointer rounded transition-colors search-item" data-product-id="${prod.id}">
          <img src="${prod.colors[0].image}" alt="${prod.name}" class="w-12 h-14 object-cover rounded-sm" />
          <div class="flex-1">
            <h5 class="font-serif text-sm text-text-primary">${prod.name}</h5>
            <div class="text-[11px] text-text-muted">${prod.category} · ${formatPrice(prod.priceEUR)}</div>
          </div>
          <button type="button" class="text-xs uppercase tracking-wider text-text-secondary">View</button>
        </div>
      `).join('');

      document.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          const pid = item.getAttribute('data-product-id');
          closeSearch();
          openQuickView(pid);
        });
      });
    });
  }


  // Newsletter Submit with CMS synchronization
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput && emailInput.value) {
        const email = emailInput.value.trim();
        try {
          const response = await fetch('/api/subscribers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          if (!response.ok) throw new Error('Subscription request failed');
          const result = await response.json();
          if (!result.success) throw new Error('Subscription was not saved');
        } catch (err) {
          showToast('We could not save your subscription. Please try again later.');
          return;
        }
        showToast(`Welcome to the Forméli Circle! Use code WELCOME10 for 10% off.`);
        emailInput.value = '';
      }
    });
  }

  // Checkout button simulation & Order submission to CMS
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (state.cart.length === 0) return;

      const totalEUR = state.cart.reduce((sum, item) => sum + (item.priceEUR * item.quantity), 0);
      const totalAmount = state.currency === 'ISK' ? totalEUR * 150 : totalEUR;

      const orderPayload = {
        customer_name: "Online Atelier Client",
        customer_email: "client@formeli.is",
        total_amount: totalAmount,
        currency: state.currency,
        items: state.cart.map(item => ({
          name: item.name,
          colorName: item.colorName,
          size: item.size,
          quantity: item.quantity,
          price: item.priceISK || (item.priceEUR * 150)
        })),
        notes: "Storefront order simulation"
      };

      try {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          showToast('Online checkout is not available yet. Your bag has been saved.');
          return;
        }
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (!response.ok) throw new Error('Order request failed');
        const result = await response.json();
        if (!result.success || !result.order_id) throw new Error('Order was not saved');
      } catch (err) {
        showToast('We could not save your test order. Your bag has been kept.');
        return;
      }

      alert(`✦ Forméli & Co. Boutique Checkout ✦\n\nThank you for choosing Forméli & Co. (Reykjavík, Iceland).\nTotal: ${cartSubtotalEl.textContent}\nComplimentary packaging with signature ribbon included.\n\nYour order is now logged in the Atelier CMS.`);
      state.cart = [];
      saveCart();
      renderCart();
      closeCartDrawer();
    });
  }

  // Window helper for global scroll navigation
  window.scrollToCategory = function(catKey) {
    state.activeFilter = catKey;
    filterPillBtns.forEach(b => {
      if (b.getAttribute('data-category') === catKey) {
        b.classList.add('border-text-primary', 'font-semibold');
        b.classList.remove('opacity-70', 'border-transparent');
      } else {
        b.classList.remove('border-text-primary', 'font-semibold');
        b.classList.add('opacity-70', 'border-transparent');
      }
    });
    renderProducts();
    const editSection = document.getElementById('signature-edit-section');
    if (editSection) {
      editSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // CMS Real-time Synchronization
  async function syncWithCMS() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          state.liveProducts = json.data;
          renderProducts();
        }
      }
    } catch (err) {
      // Offline fallback
    }

    try {
      const resContent = await fetch('/api/content');
      if (resContent.ok) {
        const jsonContent = await resContent.json();
        if (jsonContent.success && jsonContent.data) {
          applyLiveContent(jsonContent.data);
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }

  function applyLiveContent(content) {
    if (content.site_settings) {
      const s = content.site_settings;
      const shipBar = document.querySelector('aside .font-light.uppercase.tracking-luxury');
      if (shipBar && s.announcement_shipping) {
        shipBar.textContent = s.announcement_shipping;
      }
    }

    if (content.hero_slides && Array.isArray(content.hero_slides)) {
      content.hero_slides.forEach((slide, i) => {
        if (heroSlides[i]) {
          const bgDiv = heroSlides[i].querySelector('.bg-cover');
          if (bgDiv && slide.image) bgDiv.style.backgroundImage = `url('${slide.image}')`;
          const tagEl = heroSlides[i].querySelector('.text-oat');
          if (tagEl && slide.tag) tagEl.textContent = slide.tag;
          const h2El = heroSlides[i].querySelector('h2');
          if (h2El && slide.title) h2El.textContent = slide.title;
          const pEl = heroSlides[i].querySelector('p');
          if (pEl && slide.subtitle) pEl.textContent = slide.subtitle;
        }
      });
    }

    if (content.philosophy) {
      const p = content.philosophy;
      const philSect = document.getElementById('philosophy-section');
      if (philSect) {
        const headings = philSect.querySelectorAll('h3');
        const paragraphs = philSect.querySelectorAll('p');
        const images = philSect.querySelectorAll('img');

        if (headings[0] && p.origins_title) headings[0].textContent = p.origins_title;
        if (paragraphs[0] && p.origins_text) paragraphs[0].textContent = p.origins_text;
        if (images[0] && p.origins_image) images[0].src = p.origins_image;

        if (headings[1] && p.nordic_title) headings[1].textContent = p.nordic_title;
        if (paragraphs[1] && p.nordic_text) paragraphs[1].textContent = p.nordic_text;
        if (images[1] && p.nordic_image) images[1].src = p.nordic_image;
      }
    }
  }

  // Initial Boot
  applyTheme(state.theme);
  updateCartBadges();
  renderProducts();
  renderCart();
  syncWithCMS();
});
