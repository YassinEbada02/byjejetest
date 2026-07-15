// By jeje. Admin Dashboard View Controller
window.adminDashboard = (() => {
  let activeTab = 'analytics';

  // Core Init
  function init() {
    const isLogged = LuxeData.getStorageItem('luxeshell_admin_logged', false);
    
    const loginCard = document.getElementById('admin-login-card');
    const workspace = document.getElementById('admin-workspace-layout');

    if (!isLogged) {
      if (loginCard) loginCard.style.display = 'block';
      if (workspace) workspace.style.display = 'none';
      bindLoginEvents();
    } else {
      if (loginCard) loginCard.style.display = 'none';
      if (workspace) workspace.style.display = 'grid';
      bindWorkspaceEvents();
      switchTab(activeTab);
    }
  }

  /* -------------------------------------------------------------
     ADMIN AUTHENTICATION
     ------------------------------------------------------------- */
  function bindLoginEvents() {
    const loginForm = document.getElementById('admin-login-form');
    const loginBtn = document.getElementById('admin-login-btn');
    
    if (loginBtn) {
      loginBtn.onclick = () => {
        const user = document.getElementById('admin-username').value.trim();
        const pass = document.getElementById('admin-password').value.trim();

        if (user === 'admin' && pass === 'admin123') {
          LuxeData.setStorageItem('luxeshell_admin_logged', true);
          window.app.showToast('Access granted. Welcome to By jeje. Atelier Dashboard', 'success');
          
          document.getElementById('admin-username').value = '';
          document.getElementById('admin-password').value = '';

          init(); // Reload views
        } else {
          window.app.showToast('Invalid admin credentials. Access Denied.', 'error');
        }
      };
    }
  }

  function handleLogout() {
    window.app.showConfirmModal(
      'Log Out Admin',
      'Are you sure you want to end your current session and exit the workspace?',
      () => {
        LuxeData.setStorageItem('luxeshell_admin_logged', false);
        window.app.showToast('Logged out of admin dashboard', 'info');
        init();
      }
    );
  }

  /* -------------------------------------------------------------
     TAB SWITCHER ROUTER
     ------------------------------------------------------------- */
  function bindWorkspaceEvents() {
    // Menu tab switching clicks
    document.querySelectorAll('.admin-menu-item').forEach(item => {
      // Skip logout button
      if (item.id === 'admin-logout-btn') {
        item.onclick = handleLogout;
        return;
      }

      item.onclick = () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      };
    });

    // CRUD Modal bindings
    const closeCrudBtn = document.getElementById('admin-close-product-modal-btn');
    const cancelCrudBtn = document.getElementById('admin-cancel-product-modal-btn');
    const crudModal = document.getElementById('admin-product-crud-modal');

    const hideCrud = () => crudModal.classList.remove('active');
    if (closeCrudBtn) closeCrudBtn.addEventListener('click', hideCrud);
    if (cancelCrudBtn) cancelCrudBtn.addEventListener('click', hideCrud);

    const productForm = document.getElementById('admin-product-form');
    if (productForm) {
      productForm.onsubmit = handleProductFormSubmit;
    }

    const addProductBtn = document.getElementById('admin-add-product-btn');
    if (addProductBtn) {
      addProductBtn.onclick = () => showProductCrudModal();
    }

    // Receipt verification modal bindings
    const closeVerifyBtn = document.getElementById('admin-close-verify-modal-btn');
    const verifyModal = document.getElementById('admin-verify-receipt-modal');
    if (closeVerifyBtn) {
      closeVerifyBtn.onclick = () => verifyModal.classList.remove('active');
    }

    // Restock all button
    const restockBtn = document.getElementById('admin-restock-low-btn');
    if (restockBtn) {
      restockBtn.onclick = () => {
        window.app.showConfirmModal(
          'Restock Low Inventory',
          'Would you like to replenish all products with low stock (<= 5 pieces) up to a baseline reserve of 25 pieces?',
          () => {
            const list = LuxeData.products.getAll();
            let count = 0;
            list.forEach(p => {
              if (p.stock <= 5) {
                p.stock = 25;
                LuxeData.products.save(p);
                count++;
              }
            });
            window.app.showToast(`Restocked ${count} catalog products.`, 'success');
            if (activeTab === 'inventory') renderInventory();
            else if (activeTab === 'products') renderProducts();
          }
        );
      };
    }
  }

  function switchTab(tab) {
    activeTab = tab;
    
    // Toggle menu highlight
    document.querySelectorAll('.admin-menu-item').forEach(item => {
      if (item.getAttribute('data-tab') === tab) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle content panes
    document.querySelectorAll('.admin-content-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`admin-pane-${tab}`);
    if (targetPane) {
      targetPane.classList.add('active');
      
      // Render specific tab
      if (tab === 'analytics') renderAnalytics();
      else if (tab === 'orders') renderOrders();
      else if (tab === 'products') renderProducts();
      else if (tab === 'inventory') renderInventory();
    }
    lucide.createIcons();
  }

  /* -------------------------------------------------------------
     TAB RENDERERS: ANALYTICS
     ------------------------------------------------------------- */
  function renderAnalytics() {
    const orders = LuxeData.orders.getAll();
    const products = LuxeData.products.getAll();

    // 1. Calculate Gross Revenue from Confirmed orders
    const confirmedOrders = orders.filter(o => o.status === 'Confirmed');
    const revenueSum = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

    // 2. Pending Verification counts
    const pendingCount = orders.filter(o => o.status === 'Pending Verification').length;

    // Set text contents
    document.getElementById('metric-revenue').textContent = `${revenueSum.toFixed(0)} EGP`;
    document.getElementById('metric-orders').textContent = orders.length;
    document.getElementById('metric-pending').textContent = pendingCount;
    document.getElementById('metric-products').textContent = products.length;

    // 3. Render dynamic CSS bar chart
    const chartContainer = document.getElementById('admin-chart-bars');
    if (chartContainer) {
      const dayLabels = ['Jul 11', 'Jul 12', 'Jul 13', 'Jul 14', 'Jul 15'];
      
      const countsByDay = [0, 0, 0, 0, 0];
      
      orders.forEach(o => {
        const orderDate = new Date(o.date);
        const day = orderDate.getDate();
        if (day === 11) countsByDay[0]++;
        else if (day === 12) countsByDay[1]++;
        else if (day === 13) countsByDay[2]++;
        else if (day === 14) countsByDay[3]++;
        else if (day === 15) countsByDay[4]++;
      });

      const maxVal = Math.max(1, ...countsByDay);

      chartContainer.innerHTML = dayLabels.map((label, idx) => {
        const val = countsByDay[idx];
        const pctHeight = (val / maxVal) * 160; 
        return `
          <div class="chart-bar-wrapper">
            <div class="chart-bar" style="height: ${pctHeight}px;" data-value="${val}"></div>
            <span class="chart-label">${label}</span>
          </div>
        `;
      }).join('');
    }
  }

  /* -------------------------------------------------------------
     TAB RENDERERS: ORDERS
     ------------------------------------------------------------- */
  function renderOrders() {
    const orders = LuxeData.orders.getAll();
    const tbody = document.getElementById('admin-orders-tbody');
    
    const searchVal = document.getElementById('admin-orders-search').value.toLowerCase().trim();
    const filterStatus = document.getElementById('admin-orders-filter').value;

    let filtered = orders;

    // Filter status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    // Filter query
    if (searchVal) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchVal) ||
        o.customerName.toLowerCase().includes(searchVal) ||
        o.email.toLowerCase().includes(searchVal)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:var(--text-muted);">No order logs found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(order => {
      let badgeClass = 'badge-warning';
      if (order.status === 'Confirmed') badgeClass = 'badge-success';
      if (order.status === 'Payment Rejected') badgeClass = 'badge-danger';

      const itemsLabel = order.items.reduce((sum, item) => sum + item.quantity, 0);

      // Verify actions
      let actionBtn = '';
      if (order.status === 'Pending Verification') {
        actionBtn = `<button class="btn btn-primary btn-sm verify-btn" data-id="${order.id}">Verify Deposit</button>`;
      } else {
        actionBtn = `<button class="btn btn-secondary btn-sm verify-btn" data-id="${order.id}">View Details</button>`;
      }

      return `
        <tr>
          <td style="font-weight:600; font-family:monospace;">${order.id}</td>
          <td>
            <div class="admin-order-customer">
              <strong>${order.customerName}</strong>
              <span class="email">${order.email} | ${order.phone}</span>
            </div>
          </td>
          <td>${itemsLabel} items</td>
          <td style="color:var(--accent-pink); font-weight:600;">${order.depositAmount.toFixed(0)} EGP</td>
          <td style="font-weight:600;">${order.total.toFixed(0)} EGP</td>
          <td><span class="badge ${badgeClass}">${order.status}</span></td>
          <td>
            <div class="admin-table-action-btns">
              ${actionBtn}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Verification click
    tbody.querySelectorAll('.verify-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        showOrderVerificationModal(id);
      };
    });

    // Add search input listeners only once
    const searchInput = document.getElementById('admin-orders-search');
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener('input', renderOrders);
    }
    
    const filterSelect = document.getElementById('admin-orders-filter');
    if (filterSelect && !filterSelect.dataset.bound) {
      filterSelect.dataset.bound = "true";
      filterSelect.addEventListener('change', renderOrders);
    }
  }

  function showOrderVerificationModal(orderId) {
    const order = LuxeData.orders.getById(orderId);
    if (!order) return;

    const modal = document.getElementById('admin-verify-receipt-modal');
    
    document.getElementById('verify-order-id').textContent = order.id;
    document.getElementById('verify-order-customer').textContent = `${order.customerName} (${order.email})`;
    document.getElementById('verify-order-deposit').textContent = `${order.depositAmount.toFixed(0)} EGP`;
    document.getElementById('verify-order-total').textContent = `${order.total.toFixed(0)} EGP`;
    
    const notesInput = document.getElementById('verify-order-notes');
    notesInput.value = order.notes || '';

    const img = document.getElementById('verify-screenshot-img');
    img.src = order.screenshot || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%2327272a;"><rect width="300" height="200" fill="%2327272a"/><text x="150" y="100" fill="white" font-size="12" text-anchor="middle">No proof uploaded</text></svg>';

    const acceptBtn = document.getElementById('admin-verify-accept-btn');
    const rejectBtn = document.getElementById('admin-verify-reject-btn');

    if (order.status === 'Pending Verification') {
      acceptBtn.style.display = 'inline-flex';
      rejectBtn.style.display = 'inline-flex';
      notesInput.disabled = false;
    } else {
      acceptBtn.style.display = 'none';
      rejectBtn.style.display = 'none';
      notesInput.disabled = true;
    }

    modal.classList.add('active');

    // Clones
    const newAccept = acceptBtn.cloneNode(true);
    const newReject = rejectBtn.cloneNode(true);
    acceptBtn.parentNode.replaceChild(newAccept, acceptBtn);
    rejectBtn.parentNode.replaceChild(newReject, rejectBtn);

    newAccept.onclick = () => {
      order.status = 'Confirmed';
      order.notes = notesInput.value.trim() || 'Deposit verified approved. Production starting.';
      LuxeData.orders.save(order);
      modal.classList.remove('active');
      window.app.showToast(`Order ${order.id} payment verified. Status set to Confirmed.`, 'success');
      renderOrders();
      renderAnalytics();
    };

    newReject.onclick = () => {
      order.status = 'Payment Rejected';
      order.notes = notesInput.value.trim() || 'Payment screenshot rejected. Transaction details do not match deposit totals.';
      LuxeData.orders.save(order);
      modal.classList.remove('active');
      window.app.showToast(`Order ${order.id} payment rejected. Customer notified.`, 'error');
      renderOrders();
      renderAnalytics();
    };
  }

  /* -------------------------------------------------------------
     TAB RENDERERS: PRODUCTS CRUD
     ------------------------------------------------------------- */
  function renderProducts() {
    const list = LuxeData.products.getAll();
    const tbody = document.getElementById('admin-products-tbody');

    tbody.innerHTML = list.map(p => {
      const isFeatured = p.isFeatured ? '<span class="badge badge-gold">Featured</span>' : '<span style="color:var(--text-muted)">-</span>';
      const isVisible = p.isVisible ? '<span class="badge badge-success">Visible</span>' : '<span class="badge badge-danger">Hidden</span>';
      
      const priceText = p.discountPrice !== null 
        ? `${p.discountPrice.toFixed(0)} EGP <span style="font-size:0.75rem; text-decoration:line-through; color:var(--text-muted);">${p.price.toFixed(0)} EGP</span>` 
        : `${p.price.toFixed(0)} EGP`;

      let stockClass = '';
      let stockBadge = `<span>${p.stock} units</span>`;
      if (p.stock === 0) {
        stockClass = 'low-stock-alert';
        stockBadge = '<span class="badge badge-danger">Out of Stock</span>';
      } else if (p.stock <= 5) {
        stockClass = 'low-stock-alert';
        stockBadge = `<span class="badge badge-warning">Low: ${p.stock} left</span>`;
      }

      // Small vector case preview
      const miniSVG = LuxeData.getCaseSVG({ style: p.style, color: p.color, phoneModel: 'iPhone 15 Pro' });

      return `
        <tr class="${stockClass}">
          <td>
            <div style="width: 35px; height: 48px;">
              ${miniSVG}
            </div>
          </td>
          <td style="font-weight:600;">${p.name}</td>
          <td>${p.category} Series</td>
          <td>${priceText}</td>
          <td>${p.discountPrice ? 'Promo' : 'Standard'}</td>
          <td>${stockBadge}</td>
          <td>${isVisible}</td>
          <td>${isFeatured}</td>
          <td>
            <div class="admin-table-action-btns">
              <button class="btn btn-secondary btn-sm edit-prod-btn" data-id="${p.id}"><i data-lucide="edit-2" style="width:12px; height:12px;"></i></button>
              <button class="btn btn-danger btn-sm delete-prod-btn" data-id="${p.id}"><i data-lucide="trash-2" style="width:12px; height:12px;"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();

    // Bind edit/delete click
    tbody.querySelectorAll('.edit-prod-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        showProductCrudModal(id);
      };
    });

    tbody.querySelectorAll('.delete-prod-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const p = LuxeData.products.getById(id);
        if (p) {
          window.app.showConfirmModal(
            'Delete Case Product',
            `Are you sure you want to permanently delete design "${p.name}"? This action cannot be undone.`,
            () => {
              LuxeData.products.delete(id);
              window.app.showToast('Product successfully deleted', 'info');
              renderProducts();
            }
          );
        }
      };
    });
  }

  function showProductCrudModal(productId = null) {
    const modal = document.getElementById('admin-product-crud-modal');
    const title = document.getElementById('product-modal-title');
    
    // Form fields
    const idInput = document.getElementById('crud-product-id');
    const nameInput = document.getElementById('crud-product-name');
    const descInput = document.getElementById('crud-product-desc');
    const catSelect = document.getElementById('crud-product-category');
    const styleSelect = document.getElementById('crud-product-style');
    const priceInput = document.getElementById('crud-product-price');
    const discountInput = document.getElementById('crud-product-discount');
    const colorInput = document.getElementById('crud-product-color');
    const stockInput = document.getElementById('crud-product-stock');
    const featCheckbox = document.getElementById('crud-product-featured');
    const visCheckbox = document.getElementById('crud-product-visible');

    // Reset Form
    document.getElementById('admin-product-form').reset();
    idInput.value = '';

    if (productId) {
      const p = LuxeData.products.getById(productId);
      if (!p) return;

      title.textContent = 'Edit By jeje. Product';
      idInput.value = p.id;
      nameInput.value = p.name;
      descInput.value = p.description;
      catSelect.value = p.category;
      styleSelect.value = p.style;
      priceInput.value = p.price;
      discountInput.value = p.discountPrice !== null ? p.discountPrice : '';
      colorInput.value = p.color;
      stockInput.value = p.stock;
      featCheckbox.checked = p.isFeatured;
      visCheckbox.checked = p.isVisible;
    } else {
      title.textContent = 'Add Premium Product';
      visCheckbox.checked = true;
    }

    modal.classList.add('active');
  }

  function handleProductFormSubmit(e) {
    e.preventDefault();

    const idInput = document.getElementById('crud-product-id').value;
    const nameInput = document.getElementById('crud-product-name').value.trim();
    const descInput = document.getElementById('crud-product-desc').value.trim();
    const catSelect = document.getElementById('crud-product-category').value;
    const styleSelect = document.getElementById('crud-product-style').value;
    const priceInput = parseFloat(document.getElementById('crud-product-price').value);
    const discountInput = document.getElementById('crud-product-discount').value;
    const colorInput = document.getElementById('crud-product-color').value.trim();
    const stockInput = parseInt(document.getElementById('crud-product-stock').value);
    const featCheckbox = document.getElementById('crud-product-featured').checked;
    const visCheckbox = document.getElementById('crud-product-visible').checked;

    if (!nameInput || !descInput || isNaN(priceInput) || isNaN(stockInput)) {
      window.app.showToast('Please fill out all required fields', 'error');
      return;
    }

    const finalId = idInput || 'p-' + Math.floor(100 + Math.random() * 900);
    const discVal = discountInput !== '' ? parseFloat(discountInput) : null;

    const newProd = {
      id: finalId,
      name: nameInput,
      description: descInput,
      price: priceInput,
      discountPrice: discVal,
      category: catSelect,
      style: styleSelect,
      color: colorInput,
      isFeatured: featCheckbox,
      stock: stockInput,
      isVisible: visCheckbox,
      rating: idInput ? LuxeData.products.getById(idInput).rating : 4.8,
      reviews: idInput ? LuxeData.products.getById(idInput).reviews : 1,
      details: idInput ? LuxeData.products.getById(idInput).details : {
        material: 'Premium Protective TPU Polymers',
        thickness: '1.2mm design fit',
        protection: '8ft high impact protective standard',
        wireless: 'Wireless Qi and MagSafe Interface support'
      }
    };

    LuxeData.products.save(newProd);
    document.getElementById('admin-product-crud-modal').classList.remove('active');
    window.app.showToast(`Product "${nameInput}" saved successfully`, 'success');
    renderProducts();
  }

  /* -------------------------------------------------------------
     TAB RENDERERS: INVENTORY
     ------------------------------------------------------------- */
  function renderInventory() {
    const list = LuxeData.products.getAll();
    const tbody = document.getElementById('admin-inventory-tbody');

    tbody.innerHTML = list.map(p => {
      let healthBadge = '<span class="badge badge-success">Healthy Reserve</span>';
      if (p.stock === 0) {
        healthBadge = '<span class="badge badge-danger">Out of Stock</span>';
      } else if (p.stock <= 5) {
        healthBadge = '<span class="badge badge-warning">Low Warning</span>';
      }

      return `
        <tr>
          <td style="font-weight:600;">${p.name}</td>
          <td>${p.category} Series</td>
          <td style="font-weight:700;" id="inv-qty-label-${p.id}">${p.stock} items</td>
          <td>${healthBadge}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="btn btn-secondary btn-sm adjust-stock-btn" data-id="${p.id}" data-action="minus" style="padding:0.3rem 0.5rem;"><i data-lucide="minus" style="width:12px; height:12px;"></i></button>
              <input type="number" id="inv-input-${p.id}" value="5" min="1" max="100" style="width:50px; text-align:center; padding:0.25rem; border:1px solid var(--border-color); border-radius:4px; font-weight:600;">
              <button class="btn btn-secondary btn-sm adjust-stock-btn" data-id="${p.id}" data-action="plus" style="padding:0.3rem 0.5rem;"><i data-lucide="plus" style="width:12px; height:12px;"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();

    tbody.querySelectorAll('.adjust-stock-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const input = document.getElementById(`inv-input-${id}`);
        const count = parseInt(input.value);

        if (isNaN(count) || count < 1) return;

        const p = LuxeData.products.getById(id);
        if (p) {
          if (action === 'plus') {
            p.stock += count;
          } else {
            p.stock = Math.max(0, p.stock - count);
          }
          LuxeData.products.save(p);
          window.app.showToast('Stock quantity updated', 'success');
          renderInventory();
        }
      };
    });
  }

  return {
    init
  };
})();
