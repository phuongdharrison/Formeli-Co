// FORMÉLI & CO. — REYKJAVÍK, ICELAND
// Atelier CMS Admin Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentTab: 'dashboard',
    products: [],
    content: {},
    journal: [],
    orders: [],
    subscribers: [],
    promos: [],
    editingProductId: null
  };

  // Pre-configured Chocolate Palette for 1-click Swatches
  const CHOCOLATE_PALETTE_PRESETS = [
    { name: "Dark Chocolate", hex: "#3E2B23" },
    { name: "Espresso", hex: "#241B17" },
    { name: "Chocolate", hex: "#6A4735" },
    { name: "Mocha", hex: "#7B5A45" },
    { name: "Taupe", hex: "#A8927B" },
    { name: "Warm Oat", hex: "#CBB89E" },
    { name: "Cream", hex: "#EDE1D4" },
    { name: "Camel", hex: "#AB664F" }
  ];

  // DOM Elements
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const sectionTitleEl = document.getElementById('current-section-title');
  const toastEl = document.getElementById('admin-toast');

  // Products Tab Elements
  const productsTableBody = document.getElementById('admin-products-table-body');
  const searchProductsInput = document.getElementById('admin-search-products');
  const prodFilterBtns = document.querySelectorAll('.prod-filter-btn');
  const modalProduct = document.getElementById('modal-product');
  const formProduct = document.getElementById('form-product');
  const btnCloseProductModal = document.getElementById('btn-close-product-modal');
  const btnCancelProduct = document.getElementById('btn-cancel-product');
  const btnQuickAddProduct = document.getElementById('btn-quick-add-product');
  const colorsContainer = document.getElementById('prod-colors-container');
  const btnAddColorVariant = document.getElementById('btn-add-color-variant');

  // Price inputs for smart calculator
  const inputPriceISK = document.getElementById('prod-form-price-isk');
  const inputPriceEUR = document.getElementById('prod-form-price-eur');
  const inputPriceUSD = document.getElementById('prod-form-price-usd');

  // ==========================================================================
  // Helper Functions
  // ==========================================================================
  function showToast(message, isError = false) {
    if (!toastEl) return;
    toastEl.querySelector('.toast-text').textContent = message;
    toastEl.classList.toggle('bg-red-900', isError);
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  function formatISK(amount) {
    return new Intl.NumberFormat('is-IS').format(Math.round(amount)) + ' kr';
  }

  // Smart currency calculator
  if (inputPriceISK) {
    inputPriceISK.addEventListener('input', (e) => {
      const isk = parseFloat(e.target.value) || 0;
      if (isk > 0) {
        inputPriceEUR.value = Math.round(isk / 150);
        inputPriceUSD.value = Math.round((isk / 150) * 1.08);
      }
    });
  }

  // ==========================================================================
  // Tab Switching
  // ==========================================================================
  window.switchTab = function(tabName) {
    state.currentTab = tabName;
    tabButtons.forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', match);
      btn.classList.toggle('bg-darkchoc', match);
      btn.classList.toggle('text-oat', match);
      btn.classList.toggle('text-cream/80', !match);
    });

    tabContents.forEach(content => {
      content.classList.toggle('hidden', content.id !== `tab-${tabName}`);
    });

    const titleMap = {
      dashboard: "Tổng quan Quản trị (Dashboard)",
      products: "Quản lý Sản phẩm (Products & Catalog)",
      hero: "Banner & Hero Slides (Trang chủ)",
      content: "Triết lý & Chất liệu (Story & Materials)",
      journal: "Tạp chí Phong cách Sống (Journal)",
      orders: "Đơn hàng từ Cửa hàng (Orders)",
      vip: "Khách hàng VIP & Mã giảm giá",
      settings: "Cài đặt Cửa hàng & Vận chuyển"
    };

    if (sectionTitleEl) {
      sectionTitleEl.textContent = titleMap[tabName] || "Quản trị";
    }
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      window.switchTab(tab);
    });
  });

  // ==========================================================================
  // API Fetching & Initial Loading
  // ==========================================================================
  async function loadAllData() {
    try {
      // 1. Stats
      const resStats = await fetch('/api/stats');
      const statsJson = await resStats.json();
      if (statsJson.success) {
        updateStatsUI(statsJson.data);
      }

      // 2. Products
      const resProd = await fetch('/api/products?all=1');
      const prodJson = await resProd.json();
      if (prodJson.success) {
        state.products = prodJson.data;
        renderProductsTable();
        document.getElementById('badge-products-count').textContent = state.products.length;
        document.getElementById('filter-count-all').textContent = state.products.length;
      }

      // 3. Content Blocks
      const resContent = await fetch('/api/content');
      const contentJson = await resContent.json();
      if (contentJson.success) {
        state.content = contentJson.data;
        populateHeroSlides();
        populatePhilosophyAndMaterials();
        populateSettings();
      }

      // 4. Journal
      const resJournal = await fetch('/api/journal');
      const journalJson = await resJournal.json();
      if (journalJson.success) {
        state.journal = journalJson.data;
        renderJournal();
        document.getElementById('badge-journal-count').textContent = state.journal.length;
      }

      // 5. Orders
      const resOrders = await fetch('/api/orders');
      const ordersJson = await resOrders.json();
      if (ordersJson.success) {
        state.orders = ordersJson.data;
        renderOrders();
        renderDashboardRecentOrders();
        document.getElementById('badge-orders-count').textContent = state.orders.length;
      }

      // 6. Subscribers & Promos
      const resSubs = await fetch('/api/subscribers');
      const subsJson = await resSubs.json();
      if (subsJson.success) {
        state.subscribers = subsJson.data;
        renderSubscribers();
      }

      const resPromos = await fetch('/api/promos');
      const promosJson = await resPromos.json();
      if (promosJson.success) {
        state.promos = promosJson.data;
        renderPromos();
      }

    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      showToast("Không thể kết nối đến máy chủ API local.", true);
    }
  }

  function updateStatsUI(data) {
    document.getElementById('stat-products-count').textContent = data.active_products;
    document.getElementById('stat-orders-count').textContent = data.total_orders;
    document.getElementById('stat-revenue').textContent = formatISK(data.revenue_isk);
    document.getElementById('stat-subscribers-count').textContent = data.total_subscribers;
  }

  // ==========================================================================
  // Products Management
  // ==========================================================================
  let activeProductFilter = 'all';

  function renderProductsTable() {
    if (!productsTableBody) return;

    const query = (searchProductsInput ? searchProductsInput.value : '').toLowerCase().trim();
    const filtered = state.products.filter(p => {
      const matchCat = activeProductFilter === 'all' || p.categoryKey === activeProductFilter;
      const matchSearch = !query || p.name.toLowerCase().includes(query) || (p.composition || '').toLowerCase().includes(query);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-gray-400">
            Không tìm thấy sản phẩm nào phù hợp.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = filtered.map(p => {
      const mainColor = p.colors[0] || { image: '', hex: '#241B17', name: 'Standard' };
      const colorsPreview = p.colors.map(c => `
        <span class="inline-block w-3.5 h-3.5 rounded-full border border-gray-300" style="background-color: ${c.hex};" title="${c.name}"></span>
      `).join('');

      return `
        <tr class="hover:bg-gray-50/80 transition-colors">
          <td class="py-3 px-4">
            <img src="${mainColor.image}" alt="${p.name}" class="w-10 h-12 object-cover rounded-sm bg-gray-100" />
          </td>
          <td class="py-3 px-4">
            <div class="font-serif text-sm font-semibold text-espresso">${p.name}</div>
            <div class="text-[11px] text-gray-400 line-clamp-1">${p.tagline || ''}</div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-gray-100 text-gray-700 rounded-sm font-medium">
              ${p.category}
            </span>
          </td>
          <td class="py-3 px-4 font-mono font-semibold text-espresso">
            ${formatISK(p.priceISK)}
            <span class="block text-[10px] text-gray-400 font-normal">€${p.priceEUR} · $${p.priceUSD}</span>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-1">
              ${colorsPreview}
              <span class="text-[10px] text-gray-400 ml-1">(${p.colors.length})</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <button 
              type="button" 
              class="toggle-active-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}"
              data-id="${p.id}"
              title="Bấm để bật/tắt hiển thị"
            >
              <span class="w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-600' : 'bg-gray-400'}"></span>
              ${p.isActive ? 'Đang bán' : 'Đã ẩn'}
            </button>
          </td>
          <td class="py-3 px-4 text-right space-x-2">
            <button 
              type="button" 
              class="btn-edit-prod text-chocolate hover:underline font-semibold text-xs"
              data-id="${p.id}"
            >
              Sửa
            </button>
            <button 
              type="button" 
              class="btn-delete-prod text-red-600 hover:underline text-xs"
              data-id="${p.id}"
            >
              Xóa
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach event listeners
    document.querySelectorAll('.toggle-active-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const prod = state.products.find(p => p.id === id);
        if (prod) {
          prod.isActive = !prod.isActive;
          await updateProductAPI(prod);
          renderProductsTable();
          showToast(`Đã ${prod.isActive ? 'mở bán' : 'tạm ẩn'} sản phẩm ${prod.name}`);
        }
      });
    });

    document.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openProductModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const prod = state.products.find(p => p.id === id);
        if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prod ? prod.name : id}" không?`)) {
          await deleteProductAPI(id);
          state.products = state.products.filter(p => p.id !== id);
          renderProductsTable();
          showToast("Đã xóa sản phẩm thành công");
        }
      });
    });
  }

  // Filter Buttons
  prodFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      prodFilterBtns.forEach(b => {
        b.classList.remove('bg-espresso', 'text-cream', 'font-medium');
        b.classList.add('bg-gray-100', 'text-gray-700');
      });
      btn.classList.add('bg-espresso', 'text-cream', 'font-medium');
      btn.classList.remove('bg-gray-100', 'text-gray-700');
      activeProductFilter = btn.getAttribute('data-category');
      renderProductsTable();
    });
  });

  if (searchProductsInput) {
    searchProductsInput.addEventListener('input', renderProductsTable);
  }

  // ==========================================================================
  // Product Edit & Create Modal
  // ==========================================================================
  function openProductModal(productId = null) {
    state.editingProductId = productId;
    const isEdit = !!productId;
    document.getElementById('modal-product-title').textContent = isEdit ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm Mới";

    const prod = isEdit ? state.products.find(p => p.id === productId) : {
      id: '',
      name: '',
      category: 'Coats',
      categoryKey: 'coats',
      priceISK: 72000,
      priceEUR: 480,
      priceUSD: 520,
      tagline: '',
      composition: '',
      care: '',
      isActive: true,
      isSignature: true,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        {
          name: "Dark Chocolate",
          hex: "#3E2B23",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
          hoverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
        }
      ]
    };

    document.getElementById('prod-form-id').value = prod.id || '';
    document.getElementById('prod-form-name').value = prod.name || '';
    document.getElementById('prod-form-category').value = prod.category || 'Coats';
    document.getElementById('prod-form-price-isk').value = prod.priceISK || 72000;
    document.getElementById('prod-form-price-eur').value = prod.priceEUR || 480;
    document.getElementById('prod-form-price-usd').value = prod.priceUSD || 520;
    document.getElementById('prod-form-tagline').value = prod.tagline || '';
    document.getElementById('prod-form-composition').value = prod.composition || '';
    document.getElementById('prod-form-care').value = prod.care || '';
    document.getElementById('prod-form-active').checked = !!prod.isActive;
    document.getElementById('prod-form-signature').checked = !!prod.isSignature;
    document.getElementById('prod-form-new').checked = !!prod.isNew;

    // Check size checkboxes
    const sizeCheckboxes = document.querySelectorAll('#prod-sizes-selector input[type="checkbox"]');
    sizeCheckboxes.forEach(cb => {
      cb.checked = (prod.sizes || []).includes(cb.value);
    });

    // Populate color variants
    renderColorVariantsForm(prod.colors || []);

    modalProduct.classList.remove('hidden');
  }

  function closeProductModal() {
    modalProduct.classList.add('hidden');
    state.editingProductId = null;
  }

  if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductModal);
  if (btnCancelProduct) btnCancelProduct.addEventListener('click', closeProductModal);
  if (btnQuickAddProduct) btnQuickAddProduct.addEventListener('click', () => openProductModal(null));

  // Dynamic Color Swatches in Form
  function renderColorVariantsForm(colors) {
    if (!colorsContainer) return;
    colorsContainer.innerHTML = '';
    colors.forEach((color, idx) => {
      addColorVariantRow(color.name, color.hex, color.image, color.hoverImage, idx);
    });
  }

  function addColorVariantRow(name = '', hex = '#3E2B23', img = '', hoverImg = '', idx = Date.now()) {
    const row = document.createElement('div');
    row.className = 'color-variant-row p-3 bg-adminbg border border-gray-200 rounded-sm space-y-2';
    row.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <input type="color" value="${hex}" class="color-hex-picker w-7 h-7 rounded border border-gray-300 cursor-pointer" />
          <input type="text" placeholder="Tên màu (vd: Dark Chocolate)" value="${name}" class="color-name-input p-1.5 border border-gray-300 rounded-sm text-xs w-44 font-medium" />
          
          <!-- Quick Preset Palette Pill -->
          <div class="hidden sm:flex items-center gap-1 ml-2">
            ${CHOCOLATE_PALETTE_PRESETS.map(p => `
              <button type="button" class="preset-color-btn w-4 h-4 rounded-full border border-gray-300 hover:scale-125 transition-transform" style="background-color: ${p.hex};" data-hex="${p.hex}" data-name="${p.name}" title="${p.name}"></button>
            `).join('')}
          </div>
        </div>
        <button type="button" class="btn-remove-color text-red-500 hover:text-red-700 text-xs px-2 py-1">Xóa màu này</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <div>
          <label class="block text-[10px] uppercase text-gray-500 mb-0.5">Link ảnh chính</label>
          <input type="text" placeholder="https://..." value="${img}" class="color-img-input w-full p-1.5 border border-gray-300 rounded-sm text-xs font-mono" />
        </div>
        <div>
          <label class="block text-[10px] uppercase text-gray-500 mb-0.5">Link ảnh cận cảnh hover</label>
          <input type="text" placeholder="https://..." value="${hoverImg}" class="color-hover-img-input w-full p-1.5 border border-gray-300 rounded-sm text-xs font-mono" />
        </div>
      </div>
    `;

    // Preset color buttons
    row.querySelectorAll('.preset-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelector('.color-hex-picker').value = btn.getAttribute('data-hex');
        row.querySelector('.color-name-input').value = btn.getAttribute('data-name');
      });
    });

    // Remove variant button
    row.querySelector('.btn-remove-color').addEventListener('click', () => {
      if (colorsContainer.children.length > 1) {
        row.remove();
      } else {
        alert("Sản phẩm phải có ít nhất một màu sắc!");
      }
    });

    colorsContainer.appendChild(row);
  }

  if (btnAddColorVariant) {
    btnAddColorVariant.addEventListener('click', () => {
      addColorVariantRow("Warm Oat", "#CBB89E", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85", "");
    });
  }

  // Handle Product Form Submit
  if (formProduct) {
    formProduct.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect sizes
      const checkedSizes = [];
      document.querySelectorAll('#prod-sizes-selector input[type="checkbox"]:checked').forEach(cb => {
        checkedSizes.push(cb.value);
      });

      // Collect colors
      const colors = [];
      document.querySelectorAll('.color-variant-row').forEach(row => {
        const name = row.querySelector('.color-name-input').value.trim() || 'Custom';
        const hex = row.querySelector('.color-hex-picker').value;
        const image = row.querySelector('.color-img-input').value.trim();
        const hoverImage = row.querySelector('.color-hover-img-input').value.trim() || image;
        colors.push({ name, hex, image, hoverImage });
      });

      const catSelect = document.getElementById('prod-form-category');
      const catOption = catSelect.options[catSelect.selectedIndex];
      const categoryKey = catOption.getAttribute('data-key') || 'essentials';

      const payload = {
        name: document.getElementById('prod-form-name').value.trim(),
        category: catSelect.value,
        category_key: categoryKey,
        price_isk: parseFloat(inputPriceISK.value) || 0,
        price_eur: parseFloat(inputPriceEUR.value) || 0,
        price_usd: parseFloat(inputPriceUSD.value) || 0,
        tagline: document.getElementById('prod-form-tagline').value.trim(),
        composition: document.getElementById('prod-form-composition').value.trim(),
        care: document.getElementById('prod-form-care').value.trim(),
        is_active: document.getElementById('prod-form-active').checked,
        is_signature: document.getElementById('prod-form-signature').checked,
        is_new: document.getElementById('prod-form-new').checked,
        sizes: checkedSizes.length > 0 ? checkedSizes : ["One Size"],
        colors: colors.length > 0 ? colors : [{ name: "Standard", hex: "#241B17", image: "" }]
      };

      try {
        if (state.editingProductId) {
          // Update
          payload.id = state.editingProductId;
          const res = await fetch(`/api/products/${state.editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const resJson = await res.json();
          if (resJson.success) {
            showToast("Đã cập nhật sản phẩm thành công!");
          }
        } else {
          // Create
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const resJson = await res.json();
          if (resJson.success) {
            showToast("Đã tạo sản phẩm mới thành công!");
          }
        }

        closeProductModal();
        await loadAllData();
      } catch (err) {
        showToast("Lỗi khi lưu sản phẩm", true);
      }
    });
  }

  async function updateProductAPI(prod) {
    const payload = {
      name: prod.name,
      category: prod.category,
      category_key: prod.categoryKey,
      price_isk: prod.priceISK,
      price_eur: prod.priceEUR,
      price_usd: prod.priceUSD,
      rating: prod.rating,
      is_new: prod.isNew,
      is_signature: prod.isSignature,
      is_active: prod.isActive,
      tagline: prod.tagline,
      composition: prod.composition,
      care: prod.care,
      sizes: prod.sizes,
      colors: prod.colors
    };
    await fetch(`/api/products/${prod.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async function deleteProductAPI(id) {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // Hero Slides Management
  // ==========================================================================
  function populateHeroSlides() {
    const container = document.getElementById('hero-slides-admin-list');
    if (!container || !state.content.hero_slides) return;

    container.innerHTML = state.content.hero_slides.map((slide, idx) => `
      <div class="bg-white border border-gray-200 p-6 rounded-sm shadow-sm flex flex-col md:flex-row gap-6 hero-slide-card" data-index="${idx}">
        <!-- Thumbnail preview -->
        <div class="w-full md:w-56 h-36 bg-gray-100 rounded-sm overflow-hidden shrink-0 relative">
          <img src="${slide.image}" alt="${slide.title}" class="w-full h-full object-cover" />
          <span class="absolute top-2 left-2 bg-espresso/80 text-cream px-2 py-0.5 text-[10px] tracking-wider font-semibold">
            SLIDE 0${idx + 1}
          </span>
        </div>

        <!-- Form fields -->
        <div class="flex-1 space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Dòng chữ nhỏ (Tagline)</label>
              <input type="text" value="${slide.tag}" class="slide-tag w-full p-2 border border-gray-200 rounded-sm" />
            </div>
            <div>
              <label class="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Link ảnh nền</label>
              <input type="text" value="${slide.image}" class="slide-image w-full p-2 border border-gray-200 rounded-sm font-mono text-[11px]" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Tiêu đề lớn</label>
            <input type="text" value="${slide.title}" class="slide-title w-full p-2 border border-gray-200 rounded-sm font-serif text-base" />
          </div>

          <div>
            <label class="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Phụ đề mô tả</label>
            <textarea rows="2" class="slide-subtitle w-full p-2 border border-gray-200 rounded-sm leading-relaxed">${slide.subtitle}</textarea>
          </div>
        </div>
      </div>
    `).join('');

    const btnSaveHero = document.getElementById('btn-save-hero-slides');
    if (btnSaveHero) {
      btnSaveHero.onclick = async () => {
        const cards = document.querySelectorAll('.hero-slide-card');
        const updatedSlides = [];
        cards.forEach((card, i) => {
          updatedSlides.push({
            id: `slide-${i + 1}`,
            tag: card.querySelector('.slide-tag').value.trim(),
            title: card.querySelector('.slide-title').value.trim(),
            subtitle: card.querySelector('.slide-subtitle').value.trim(),
            image: card.querySelector('.slide-image').value.trim(),
            cta_primary_text: state.content.hero_slides[i]?.cta_primary_text || "Discover The Collection",
            cta_primary_link: state.content.hero_slides[i]?.cta_primary_link || "#signature-edit-section",
            cta_secondary_text: state.content.hero_slides[i]?.cta_secondary_text || "Our Materials",
            cta_secondary_link: state.content.hero_slides[i]?.cta_secondary_link || "#materials-section"
          });
        });

        await fetch('/api/content/hero_slides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSlides)
        });
        showToast("Đã lưu các Slide Hero thành công!");
      };
    }
  }

  // ==========================================================================
  // Philosophy & Materials Management
  // ==========================================================================
  function populatePhilosophyAndMaterials() {
    const phil = state.content.philosophy || {};
    document.getElementById('phil-origins-tag').value = phil.origins_tag || '';
    document.getElementById('phil-origins-title').value = phil.origins_title || '';
    document.getElementById('phil-origins-text').value = phil.origins_text || '';
    document.getElementById('phil-origins-img').value = phil.origins_image || '';

    document.getElementById('phil-nordic-tag').value = phil.nordic_tag || '';
    document.getElementById('phil-nordic-title').value = phil.nordic_title || '';
    document.getElementById('phil-nordic-text').value = phil.nordic_text || '';
    document.getElementById('phil-nordic-img').value = phil.nordic_image || '';

    const btnSavePhil = document.getElementById('btn-save-philosophy');
    if (btnSavePhil) {
      btnSavePhil.onclick = async () => {
        const payload = {
          origins_tag: document.getElementById('phil-origins-tag').value.trim(),
          origins_title: document.getElementById('phil-origins-title').value.trim(),
          origins_text: document.getElementById('phil-origins-text').value.trim(),
          origins_image: document.getElementById('phil-origins-img').value.trim(),
          nordic_tag: document.getElementById('phil-nordic-tag').value.trim(),
          nordic_title: document.getElementById('phil-nordic-title').value.trim(),
          nordic_text: document.getElementById('phil-nordic-text').value.trim(),
          nordic_image: document.getElementById('phil-nordic-img').value.trim()
        };
        await fetch('/api/content/philosophy', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast("Đã lưu nội dung Triết lý!");
      };
    }

    // Materials
    const mat = state.content.materials || {};
    document.getElementById('mat-stat1-val').value = mat.stat1_value || '';
    document.getElementById('mat-stat1-lbl').value = mat.stat1_label || '';
    document.getElementById('mat-stat2-val').value = mat.stat2_value || '';
    document.getElementById('mat-stat2-lbl').value = mat.stat2_label || '';
    document.getElementById('mat-stat3-val').value = mat.stat3_value || '';
    document.getElementById('mat-stat3-lbl').value = mat.stat3_label || '';

    const btnSaveMat = document.getElementById('btn-save-materials');
    if (btnSaveMat) {
      btnSaveMat.onclick = async () => {
        const payload = {
          tag: mat.tag || "Provenance & Textiles",
          title: mat.title || "The Beauty in Natural Materials",
          subtitle: mat.subtitle || "",
          stat1_value: document.getElementById('mat-stat1-val').value.trim(),
          stat1_label: document.getElementById('mat-stat1-lbl').value.trim(),
          stat2_value: document.getElementById('mat-stat2-val').value.trim(),
          stat2_label: document.getElementById('mat-stat2-lbl').value.trim(),
          stat3_value: document.getElementById('mat-stat3-val').value.trim(),
          stat3_label: document.getElementById('mat-stat3-lbl').value.trim(),
          bg_image: mat.bg_image || ""
        };
        await fetch('/api/content/materials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast("Đã lưu chỉ số Chất liệu!");
      };
    }
  }

  // ==========================================================================
  // Store Settings Management
  // ==========================================================================
  function populateSettings() {
    const s = state.content.site_settings || {};
    document.getElementById('setting-announcement').value = s.announcement_shipping || '';
    document.getElementById('setting-freeship-isk').value = s.free_shipping_threshold_isk || 45000;
    document.getElementById('setting-freeship-eur').value = s.free_shipping_threshold_eur || 300;
    document.getElementById('setting-freeship-usd').value = s.free_shipping_threshold_usd || 350;

    document.getElementById('setting-boutique-address').value = s.flagship_address || '';
    document.getElementById('setting-boutique-hours').value = s.flagship_hours || '';
    document.getElementById('setting-boutique-phone').value = s.flagship_phone || '';
    document.getElementById('setting-boutique-email').value = s.flagship_email || '';

    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
      btnSaveSettings.onclick = async () => {
        const payload = {
          announcement_shipping: document.getElementById('setting-announcement').value.trim(),
          free_shipping_threshold_isk: parseFloat(document.getElementById('setting-freeship-isk').value) || 45000,
          free_shipping_threshold_eur: parseFloat(document.getElementById('setting-freeship-eur').value) || 300,
          free_shipping_threshold_usd: parseFloat(document.getElementById('setting-freeship-usd').value) || 350,
          default_currency: "ISK",
          flagship_address: document.getElementById('setting-boutique-address').value.trim(),
          flagship_hours: document.getElementById('setting-boutique-hours').value.trim(),
          flagship_phone: document.getElementById('setting-boutique-phone').value.trim(),
          flagship_email: document.getElementById('setting-boutique-email').value.trim()
        };

        await fetch('/api/content/site_settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast("Đã lưu Cài đặt cửa hàng thành công!");
      };
    }
  }

  // ==========================================================================
  // Journal Management
  // ==========================================================================
  function renderJournal() {
    const list = document.getElementById('admin-journal-list');
    if (!list) return;

    list.innerHTML = state.journal.map(art => `
      <div class="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm flex flex-col justify-between">
        <img src="${art.image}" alt="${art.title}" class="h-36 w-full object-cover" />
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] uppercase font-semibold text-chocolate tracking-wider block mb-1">${art.tag}</span>
            <h4 class="font-serif text-base text-espresso font-semibold mb-1 line-clamp-2">${art.title}</h4>
            <p class="text-xs text-gray-500 font-light line-clamp-2 mb-3">${art.summary}</p>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            <span>${art.read_time}</span>
            <button type="button" class="btn-del-article text-red-500 hover:underline" data-id="${art.id}">Xóa bài</button>
          </div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-del-article').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
          await fetch(`/api/journal/${id}`, { method: 'DELETE' });
          state.journal = state.journal.filter(a => a.id !== id);
          renderJournal();
          showToast("Đã xóa bài viết");
        }
      };
    });

    const btnAddArticle = document.getElementById('btn-add-article');
    if (btnAddArticle) {
      btnAddArticle.onclick = async () => {
        const title = prompt("Nhập tiêu đề bài viết mới:");
        if (!title) return;
        const tag = prompt("Nhập thẻ thể loại (vd: STYLE EDITORIAL, PHILOSOPHY):", "STYLE EDITORIAL");
        const summary = prompt("Nhập tóm tắt bài viết:");
        const img = prompt("Nhập URL ảnh minh họa:", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80");

        const payload = {
          tag: tag || "EDITORIAL",
          title: title,
          summary: summary || "",
          image: img || "",
          date_str: "Mùa Thu / Đông 2026",
          read_time: "5 min read"
        };

        const res = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resJson = await res.json();
        if (resJson.success) {
          showToast("Đã xuất bản bài viết mới!");
          await loadAllData();
        }
      };
    }
  }

  // ==========================================================================
  // Orders Management
  // ==========================================================================
  function renderOrders() {
    const tbody = document.getElementById('admin-orders-table-body');
    if (!tbody) return;

    if (state.orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">Chưa có đơn hàng nào.</td></tr>`;
      return;
    }

    const statusBadge = {
      pending: '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">Chờ duyệt</span>',
      in_preparation: '<span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-medium">Đang may đo</span>',
      completed: '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">Đã hoàn thành</span>'
    };

    tbody.innerHTML = state.orders.map(ord => {
      const itemsList = (ord.items || []).map(i => `${i.quantity}x ${i.name} (${i.colorName || ''}, ${i.size || ''})`).join(', ');
      return `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-mono font-medium text-espresso">${ord.id}</td>
          <td class="p-3">
            <div class="font-medium text-espresso">${ord.customer_name || 'Khách vãng lai'}</div>
            <div class="text-[11px] text-gray-400 font-mono">${ord.customer_email || ''}</div>
          </td>
          <td class="p-3 text-[11px] text-gray-600 max-w-xs truncate" title="${itemsList}">${itemsList || 'Trống'}</td>
          <td class="p-3 font-mono font-semibold text-espresso">${formatISK(ord.total_amount)}</td>
          <td class="p-3 text-[11px] text-gray-400">${new Date(ord.created_at).toLocaleDateString('vi-VN')}</td>
          <td class="p-3">${statusBadge[ord.status] || ord.status}</td>
          <td class="p-3 text-right space-x-1">
            <button type="button" class="btn-order-status px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px]" data-id="${ord.id}" data-status="in_preparation">May đo</button>
            <button type="button" class="btn-order-status px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px]" data-id="${ord.id}" data-status="completed">Đã giao</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-order-status').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const st = btn.getAttribute('data-status');
        await fetch(`/api/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: st })
        });
        const ord = state.orders.find(o => o.id === id);
        if (ord) ord.status = st;
        renderOrders();
        renderDashboardRecentOrders();
        showToast(`Đã cập nhật trạng thái đơn ${id}`);
      };
    });
  }

  function renderDashboardRecentOrders() {
    const container = document.getElementById('dashboard-recent-orders');
    if (!container) return;

    if (state.orders.length === 0) {
      container.innerHTML = `<div class="py-6 text-center text-xs text-gray-400">Chưa có đơn hàng nào phát sinh.</div>`;
      return;
    }

    container.innerHTML = state.orders.slice(0, 3).map(ord => `
      <div class="flex items-center justify-between p-3 bg-adminbg border border-gray-100 rounded-sm text-xs">
        <div>
          <span class="font-mono font-semibold text-espresso">${ord.id}</span>
          <span class="text-gray-400 mx-1">·</span>
          <span class="text-gray-600">${ord.customer_name || 'Khách đặt trực tuyến'}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-mono font-semibold text-espresso">${formatISK(ord.total_amount)}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full ${ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${ord.status}
          </span>
        </div>
      </div>
    `).join('');
  }

  // ==========================================================================
  // VIP Subscribers & Promo Codes
  // ==========================================================================
  function renderSubscribers() {
    const list = document.getElementById('admin-subscribers-list');
    if (!list) return;

    if (state.subscribers.length === 0) {
      list.innerHTML = `<div class="p-4 text-center text-xs text-gray-400">Chưa có thành viên đăng ký VIP.</div>`;
      return;
    }

    list.innerHTML = state.subscribers.map(sub => `
      <div class="p-2.5 flex items-center justify-between text-xs">
        <span class="font-mono text-espresso">${sub.email}</span>
        <span class="text-[10px] text-gray-400">${new Date(sub.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    `).join('');

    const btnExport = document.getElementById('btn-export-subscribers');
    if (btnExport) {
      btnExport.onclick = () => {
        const csvContent = "data:text/csv;charset=utf-8," + ["Email,Date"].concat(state.subscribers.map(s => `"${s.email}","${s.created_at}"`)).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `formeli_vip_subscribers_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast("Đã tải về danh sách email CSV");
      };
    }
  }

  function renderPromos() {
    const list = document.getElementById('admin-promos-list');
    if (!list) return;

    list.innerHTML = state.promos.map(pr => `
      <div class="p-2.5 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-espresso uppercase px-2 py-0.5 bg-gray-100 rounded">${pr.code}</span>
          <span class="text-emerald-600 font-semibold">-${pr.discount_percent}%</span>
        </div>
        <button type="button" class="btn-del-promo text-red-500 hover:text-red-700 text-xs" data-code="${pr.code}">Xóa</button>
      </div>
    `).join('');

    list.querySelectorAll('.btn-del-promo').forEach(btn => {
      btn.onclick = async () => {
        const code = btn.getAttribute('data-code');
        await fetch(`/api/promos/${code}`, { method: 'DELETE' });
        state.promos = state.promos.filter(p => p.code !== code);
        renderPromos();
        showToast(`Đã xóa mã ${code}`);
      };
    });

    const formPromo = document.getElementById('form-add-promo');
    if (formPromo) {
      formPromo.onsubmit = async (e) => {
        e.preventDefault();
        const code = document.getElementById('input-promo-code').value.trim().toUpperCase();
        const pct = parseFloat(document.getElementById('input-promo-percent').value) || 10;
        await fetch('/api/promos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, discount_percent: pct })
        });
        document.getElementById('input-promo-code').value = '';
        document.getElementById('input-promo-percent').value = '';
        await loadAllData();
        showToast(`Đã thêm mã ưu đãi ${code} (-${pct}%)`);
      };
    }
  }

  // ==========================================================================
  // Backup & Restore
  // ==========================================================================
  const btnBackup = document.getElementById('btn-backup-data');
  if (btnBackup) {
    btnBackup.onclick = async () => {
      const res = await fetch('/api/backup');
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formeli_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã tải file sao lưu dữ liệu toàn bộ hệ thống!");
    };
  }

  const btnRestore = document.getElementById('btn-restore-data');
  if (btnRestore) {
    btnRestore.onclick = async () => {
      if (confirm("CẢNH BÁO: Hành động này sẽ đặt lại toàn bộ sản phẩm và nội dung về bộ dữ liệu gốc chuẩn Forméli & Co. Bạn có muốn tiếp tục?")) {
        const res = await fetch('/api/restore', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          showToast("Đã khôi phục cài đặt gốc thành công!");
          await loadAllData();
        }
      }
    };
  }

  // Initial Load
  loadAllData();
});
