// ==========================================================================
// MedLink — payments.js
// Card numbers never leave the browser in full — only the last 4 digits are
// ever sent to the backend, matching how real payment processors work
// (the backend should never see or store raw card numbers).
// ==========================================================================

function showBanner(message, type) {
  const status = document.getElementById('paymentStatus');
  if (!status) return;
  status.textContent = message;
  status.className = `status-banner show ${type}`;
}

function formatMoney(value) {
  return '₹' + Number(value).toFixed(2);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const openFormBtn = document.getElementById('openFormBtn');
const addMethodLink = document.getElementById('addMethodLink');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const paymentForm = document.getElementById('paymentForm');
const methodsEmpty = document.getElementById('methodsEmpty');
const methodsList = document.getElementById('methodsList');

function showForm() {
  methodsEmpty.style.display = 'none';
  paymentForm.style.display = 'block';
}
openFormBtn.addEventListener('click', showForm);
addMethodLink.addEventListener('click', (e) => { e.preventDefault(); showForm(); });
cancelFormBtn.addEventListener('click', function () {
  paymentForm.style.display = 'none';
  paymentForm.reset();
});

function renderMethods(methods) {
  if (!methods.length) {
    methodsList.style.display = 'none';
    methodsList.innerHTML = '';
    methodsEmpty.style.display = 'block';
    return;
  }

  methodsEmpty.style.display = 'none';
  methodsList.style.display = 'block';
  methodsList.innerHTML = methods.map(m => `
    <div class="item-row" data-id="${m.id}">
      <div>
        <div class="item-row__main"><i class="ti ti-credit-card" style="margin-right:6px;"></i>Card ending ${m.last4}</div>
        <div class="item-row__sub">${m.cardHolderName} · Expires ${String(m.expiryMonth).padStart(2, '0')}/${String(m.expiryYear).slice(-2)}</div>
      </div>
      <button class="btn-secondary" type="button" data-remove="${m.id}">Remove</button>
    </div>
  `).join('');

  methodsList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await apiRequest(`/payment-methods/${btn.dataset.remove}`, { method: 'DELETE' });
        loadMethods();
      } catch (err) {
        showBanner(err.message, 'error');
      }
    });
  });
}

async function loadMethods() {
  try {
    const methods = await apiRequest('/payment-methods');
    renderMethods(methods);
  } catch (err) {
    showBanner(err.message, 'error');
  }
}

paymentForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const cardHolderName = document.getElementById('cardName').value.trim();
  const rawNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expiry = document.getElementById('cardExpiry').value.trim();
  const [mm, yy] = expiry.split('/');

  if (!cardHolderName || rawNumber.length < 4 || !mm || !yy) {
    showBanner('Please fill in every field correctly (expiry as MM/YY).', 'error');
    return;
  }

  // Only the last 4 digits are ever sent — the full number never leaves this page.
  const last4 = rawNumber.slice(-4);

  try {
    await apiRequest('/payment-methods', {
      method: 'POST',
      body: JSON.stringify({
        cardHolderName,
        last4,
        expiryMonth: parseInt(mm, 10),
        expiryYear: 2000 + parseInt(yy, 10),
      }),
    });
    paymentForm.reset();
    paymentForm.style.display = 'none';
    showBanner('Card added.', 'success');
    loadMethods();
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// ---------- Payment history, derived from real orders ----------

async function loadHistory() {
  const table = document.getElementById('historyTable');
  const body = document.getElementById('historyBody');
  const empty = document.getElementById('historyEmpty');

  try {
    const user = getUser();
    const orders = await apiRequest('/orders');
    // Pharmacy owners paid for these; distributors don't "pay", so only
    // show history for buyers. Distributors see an explanatory empty state.
    if (user && user.role === 'DISTRIBUTOR') {
      empty.querySelector('h3').textContent = 'No payment history for distributor accounts';
      empty.querySelector('p').textContent = 'Payment history reflects money paid out by pharmacy owners for their orders.';
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    if (!orders.length) {
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    table.style.display = '';
    empty.style.display = 'none';
    body.innerHTML = orders.map(o => `
      <tr>
        <td>${formatDate(o.createdAt)}</td>
        <td>${o.paymentMethod || 'COD'}</td>
        <td>#${o.id.slice(0, 8)}</td>
        <td>${formatMoney(o.totalAmount)}</td>
      </tr>
    `).join('');
  } catch (err) {
    empty.querySelector('h3').textContent = 'Could not load payment history';
    empty.querySelector('p').textContent = err.message;
    table.style.display = 'none';
    empty.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMethods();
  loadHistory();
});
