// ==========================================================================
// MedLink — medicines.js
// Powers search-medicines.html. Behaves differently depending on account role.
// ==========================================================================

function showBanner(message, type) {
  const banner = document.getElementById('statusBanner');
  if (!banner) return;
  banner.textContent = message;
  banner.className = `status-banner show ${type}`;
}

function formatMoney(value) {
  return '₹' + Number(value).toFixed(2);
}

const user = getUser();
const isDistributor = user && user.role === 'DISTRIBUTOR';

document.addEventListener('DOMContentLoaded', () => {
  if (isDistributor) {
    document.getElementById('distributorSection').style.display = 'block';
    document.getElementById('pageHeader').querySelector('h1').textContent = 'Medicine catalog';
    document.getElementById('pageHeader').querySelector('p').textContent = 'Add medicines to your catalog and manage what you have listed.';
    loadMyListings();
  } else {
    document.getElementById('ownerSection').style.display = 'block';
    loadResults('');
  }
});

// ---------- Pharmacy owner: search + add to cart ----------

const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hideSuggestions();
    loadResults(document.getElementById('searchInput').value.trim());
  });
}

// ---------- Live search suggestions (debounced, as-you-type) ----------

let suggestTimer = null;
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');

function hideSuggestions() {
  if (suggestionsBox) {
    suggestionsBox.style.display = 'none';
    suggestionsBox.innerHTML = '';
  }
}

if (searchInput && suggestionsBox) {
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim();
    clearTimeout(suggestTimer);

    if (term.length < 2) {
      hideSuggestions();
      return;
    }

    suggestTimer = setTimeout(async () => {
      try {
        const matches = await apiRequest(`/medicines?search=${encodeURIComponent(term)}`);
        if (!matches.length) {
          hideSuggestions();
          return;
        }

        suggestionsBox.innerHTML = matches.slice(0, 8).map(m => `
          <div class="suggestion-item" data-name="${m.name.replace(/"/g, '&quot;')}"
               style="padding:10px 16px; cursor:pointer; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <span><i class="ti ti-search" style="margin-right:8px; color:var(--text-secondary);"></i>${m.name}</span>
            <span style="font-size:12px; color:var(--text-secondary);">${m.distributor ? m.distributor.businessName : ''}</span>
          </div>
        `).join('');
        suggestionsBox.style.display = 'block';

        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('mouseenter', () => { item.style.background = 'var(--surface-soft)'; });
          item.addEventListener('mouseleave', () => { item.style.background = ''; });
          item.addEventListener('click', () => {
            searchInput.value = item.dataset.name;
            hideSuggestions();
            loadResults(item.dataset.name);
          });
        });
      } catch (err) {
        hideSuggestions();
      }
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      hideSuggestions();
    }
  });
}

async function loadResults(term) {
  const table = document.getElementById('resultsTable');
  const body = document.getElementById('resultsBody');
  const empty = document.getElementById('resultsEmptyState');

  try {
    const query = term ? `?search=${encodeURIComponent(term)}` : '';
    const medicines = await apiRequest(`/medicines${query}`);

    if (!medicines.length) {
      table.style.display = 'none';
      empty.style.display = 'block';
      document.getElementById('emptyTitle').textContent = term ? `No results for "${term}"` : 'No medicines listed yet';
      document.getElementById('emptyText').textContent = term
        ? 'Try a different search term.'
        : "Once a distributor lists their catalog, you'll be able to search and add items straight to your cart.";
      return;
    }

    table.style.display = '';
    empty.style.display = 'none';
    body.innerHTML = medicines.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.manufacturer}</td>
        <td>${m.distributor ? m.distributor.businessName : '—'}</td>
        <td>${m.distributor && m.distributor.addresses && m.distributor.addresses[0] ? m.distributor.addresses[0].city : '—'}</td>
        <td>${formatMoney(m.price)}</td>
        <td>${m.stock}</td>
        <td><input type="number" min="1" max="${m.stock}" value="1" class="table-input" style="max-width:70px;" id="qty-${m.id}"></td>
        <td><button class="btn-secondary" type="button" data-id="${m.id}">Add to cart</button></td>
      </tr>
    `).join('');

    body.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const medicine = medicines.find(m => m.id === btn.dataset.id);
        const qtyInput = document.getElementById(`qty-${medicine.id}`);
        const quantity = Math.max(1, parseInt(qtyInput.value, 10) || 1);

        if (quantity > medicine.stock) {
          showBanner(`Only ${medicine.stock} in stock for ${medicine.name} — please reduce the quantity.`, 'error');
          qtyInput.value = medicine.stock;
          qtyInput.focus();
          return;
        }

        addToCart(medicine, quantity);
        showBanner(`Added ${quantity} × ${medicine.name} to your cart.`, 'success');
      });
    });
  } catch (err) {
    showBanner(err.message, 'error');
  }
}

// ---------- Distributor: bulk add + manage listings ----------

let bulkRowCount = 0;

function addBulkRow() {
  bulkRowCount++;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="bulkName table-input" placeholder="e.g. Paracetamol 650mg"></td>
    <td><input type="text" class="bulkManufacturer table-input" placeholder="e.g. Cipla"></td>
    <td><input type="number" class="bulkPrice table-input" min="0" step="0.01" style="max-width:100px;" placeholder="25.00"></td>
    <td><input type="number" class="bulkStock table-input" min="0" step="1" style="max-width:90px;" placeholder="500"></td>
    <td><input type="date" class="bulkExpiry table-input" style="max-width:150px;"></td>
    <td><button class="row-remove-btn" type="button" title="Remove row"><i class="ti ti-trash"></i></button></td>
  `;
  tr.querySelector('button').addEventListener('click', () => tr.remove());
  document.getElementById('bulkTableBody').appendChild(tr);
}

const addRowBtn = document.getElementById('addRowBtn');
if (addRowBtn) {
  addRowBtn.addEventListener('click', addBulkRow);

  // Start with 3 blank rows so it's obvious you can fill in several at once.
  addBulkRow();
  addBulkRow();
  addBulkRow();

  document.getElementById('submitBulkBtn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('#bulkTableBody tr');
    const medicines = [];

    rows.forEach(tr => {
      const name = tr.querySelector('.bulkName').value.trim();
      const manufacturer = tr.querySelector('.bulkManufacturer').value.trim();
      const price = tr.querySelector('.bulkPrice').value;
      const stock = tr.querySelector('.bulkStock').value;
      const expiryDate = tr.querySelector('.bulkExpiry').value;

      // Skip rows left completely empty — only include fully-filled rows.
      if (name && manufacturer && price && stock && expiryDate) {
        medicines.push({ name, manufacturer, price: parseFloat(price), stock: parseInt(stock, 10), expiryDate });
      }
    });

    if (!medicines.length) {
      showBanner('Fill in at least one complete row before submitting.', 'error');
      return;
    }

    try {
      const result = await apiRequest('/medicines/bulk', { method: 'POST', body: JSON.stringify({ medicines }) });
      showBanner(`Added ${result.count} medicine(s) to your catalog.`, 'success');
      document.getElementById('bulkTableBody').innerHTML = '';
      addBulkRow();
      addBulkRow();
      addBulkRow();
      loadMyListings();
    } catch (err) {
      showBanner(err.message, 'error');
    }
  });
}

async function loadMyListings() {
  const table = document.getElementById('myListingsTable');
  const body = document.getElementById('myListingsBody');
  const empty = document.getElementById('listingsEmptyState');

  try {
    const medicines = await apiRequest('/medicines');
    const mine = medicines.filter(m => m.distributor && m.distributor.businessName === user.businessName);

    if (!mine.length) {
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    table.style.display = '';
    empty.style.display = 'none';
    body.innerHTML = mine.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.manufacturer}</td>
        <td>${formatMoney(m.price)}</td>
        <td>${m.stock}</td>
      </tr>
    `).join('');
  } catch (err) {
    showBanner(err.message, 'error');
  }
}
