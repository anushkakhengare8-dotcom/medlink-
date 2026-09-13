// ==========================================================================
// MedLink — checkout.js
// Renders the cart, loads real saved addresses/cards, and places a real
// order against the backend — a delivery address is required, and a card
// payment requires an actual saved card (last-4-only, never a full number).
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

let savedAddresses = [];
let savedCards = [];

function renderCart() {
  const items = getCart();
  const table = document.getElementById('cartTable');
  const body = document.getElementById('cartBody');
  const empty = document.getElementById('cartEmptyState');
  const totalCard = document.getElementById('totalCard');

  if (!items.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    totalCard.style.display = 'none';
    return;
  }

  table.style.display = '';
  empty.style.display = 'none';
  totalCard.style.display = 'block';

  body.innerHTML = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.distributorName || '—'}</td>
      <td>${formatMoney(item.price)}</td>
      <td><input type="number" min="1" value="${item.quantity}" style="width:60px;" data-id="${item.medicineId}" class="qtyInput"></td>
      <td>${formatMoney(item.price * item.quantity)}</td>
      <td><button class="btn-secondary" type="button" data-remove="${item.medicineId}">Remove</button></td>
    </tr>
  `).join('');

  document.getElementById('cartTotal').textContent = formatMoney(cartTotal(items));

  body.querySelectorAll('.qtyInput').forEach(input => {
    input.addEventListener('change', () => {
      const quantity = Math.max(1, parseInt(input.value, 10) || 1);
      updateCartQuantity(input.dataset.id, quantity);
      renderCart();
    });
  });

  body.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.remove);
      renderCart();
    });
  });
}

// ---------- Delivery address (entered right here, no separate page needed) ----------

async function loadAddresses(selectId) {
  const select = document.getElementById('addressSelect');
  const addLink = document.getElementById('addNewAddressLink');
  const inlineForm = document.getElementById('inlineAddressForm');

  try {
    savedAddresses = await apiRequest('/addresses');
  } catch (err) {
    savedAddresses = [];
  }

  if (!savedAddresses.length) {
    // First time here — just show the simple form directly, nothing to pick from yet.
    select.style.display = 'none';
    addLink.style.display = 'none';
    inlineForm.style.display = 'block';
    return;
  }

  // Already have addresses on file — show the quick picker, keep the form tucked away.
  select.style.display = 'block';
  addLink.style.display = 'inline-block';
  inlineForm.style.display = 'none';
  select.innerHTML = savedAddresses.map(a =>
    `<option value="${a.id}">${a.line}, ${a.city}</option>`
  ).join('');

  if (selectId) select.value = selectId;
}

document.getElementById('addNewAddressLink').addEventListener('click', (e) => {
  e.preventDefault();
  const inlineForm = document.getElementById('inlineAddressForm');
  inlineForm.style.display = inlineForm.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('saveNewAddressBtn').addEventListener('click', async () => {
  const payload = {
    line: document.getElementById('newAddrLine').value.trim(),
    city: document.getElementById('newAddrCity').value.trim(),
    state: document.getElementById('newAddrState').value.trim(),
    pincode: document.getElementById('newAddrPincode').value.trim(),
    phone: document.getElementById('newAddrPhone').value.trim(),
  };

  if (!payload.line || !payload.city || !payload.state || !payload.pincode || !payload.phone) {
    showBanner('Please fill in every address field.', 'error');
    return;
  }

  try {
    const saved = await apiRequest('/addresses', { method: 'POST', body: JSON.stringify(payload) });
    ['newAddrLine', 'newAddrCity', 'newAddrState', 'newAddrPincode', 'newAddrPhone'].forEach(id => {
      document.getElementById(id).value = '';
    });
    showBanner('Address saved.', 'success');
    await loadAddresses(saved.id);
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// ---------- Payment method: UPI id input / real saved card ----------

async function loadCards() {
  const select = document.getElementById('cardSelect');
  const noCardMsg = document.getElementById('noCardMsg');

  try {
    savedCards = await apiRequest('/payment-methods');
  } catch (err) {
    savedCards = [];
  }

  if (!savedCards.length) {
    select.style.display = 'none';
    noCardMsg.style.display = 'block';
    return;
  }

  select.style.display = 'block';
  noCardMsg.style.display = 'none';
  select.innerHTML = savedCards.map(c =>
    `<option value="${c.id}">${c.cardHolderName} — Card ending ${c.last4}</option>`
  ).join('');
}

function togglePaymentSections() {
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  document.getElementById('upiSection').style.display = method === 'UPI' ? 'block' : 'none';
  document.getElementById('cardSection').style.display = method === 'CARD' ? 'block' : 'none';
}

document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
  input.addEventListener('change', togglePaymentSections);
});

// ---------- Place order ----------

document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  const items = getCart();
  if (!items.length) return;

  const method = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!savedAddresses.length) {
    showBanner('Please save a delivery address above before placing an order.', 'error');
    return;
  }
  const addressId = document.getElementById('addressSelect').value;

  if (method === 'UPI' && !document.getElementById('upiId').value.trim()) {
    showBanner('Please enter a UPI ID.', 'error');
    return;
  }
  if (method === 'CARD' && !savedCards.length) {
    showBanner('Please add a card in Payments before paying by card.', 'error');
    return;
  }

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;

  showBanner(`Processing ${method} payment (demo)...`, 'success');
  await new Promise(resolve => setTimeout(resolve, 1100));

  showBanner('Payment successful (demo) — placing your order...', 'success');

  try {
    await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map(i => ({ medicineId: i.medicineId, quantity: i.quantity })),
        addressId,
        paymentMethod: method,
      }),
    });
    clearCart();
    showBanner('Order placed! Redirecting to your orders...', 'success');
    setTimeout(() => { window.location.href = 'orders.html'; }, 1200);
  } catch (err) {
    showBanner(err.message, 'error');
    btn.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  loadAddresses();
  loadCards();
  togglePaymentSections();
});
