// ==========================================================================
// MedLink — address-book.js
// ==========================================================================

function showBanner(message, type) {
  const banner = document.getElementById('statusBanner');
  if (!banner) return;
  banner.textContent = message;
  banner.className = `status-banner show ${type}`;
}

const openFormBtn = document.getElementById('openFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const addressForm = document.getElementById('addressForm');
const addressEmpty = document.getElementById('addressEmpty');
const addressList = document.getElementById('addressList');

openFormBtn.addEventListener('click', function () {
  addressEmpty.style.display = 'none';
  addressForm.style.display = 'block';
});

cancelFormBtn.addEventListener('click', function () {
  addressForm.style.display = 'none';
  addressForm.reset();
});

function renderAddresses(addresses) {
  if (!addresses.length) {
    addressList.style.display = 'none';
    addressList.innerHTML = '';
    addressEmpty.style.display = 'block';
    return;
  }

  addressEmpty.style.display = 'none';
  addressList.style.display = 'block';
  addressList.innerHTML = addresses.map(a => `
    <div class="item-row" data-id="${a.id}">
      <div>
        <div class="item-row__main"><i class="ti ti-map-pin" style="margin-right:6px;"></i>${a.label}</div>
        <div class="item-row__sub">${a.line}, ${a.city}, ${a.state} ${a.pincode} · ${a.phone}</div>
      </div>
      <button class="btn-secondary" type="button" data-remove="${a.id}">Remove</button>
    </div>
  `).join('');

  addressList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await apiRequest(`/addresses/${btn.dataset.remove}`, { method: 'DELETE' });
        loadAddresses();
      } catch (err) {
        showBanner(err.message, 'error');
      }
    });
  });
}

async function loadAddresses() {
  try {
    const addresses = await apiRequest('/addresses');
    renderAddresses(addresses);
  } catch (err) {
    showBanner(err.message, 'error');
  }
}

addressForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const payload = {
    label: document.getElementById('addrLabel').value.trim() || 'Address',
    line: document.getElementById('addrLine').value.trim(),
    city: document.getElementById('addrCity').value.trim(),
    state: document.getElementById('addrState').value.trim(),
    pincode: document.getElementById('addrPincode').value.trim(),
    phone: document.getElementById('addrPhone').value.trim(),
  };

  if (!payload.line || !payload.city || !payload.state || !payload.pincode || !payload.phone) {
    showBanner('Please fill in every field.', 'error');
    return;
  }

  try {
    await apiRequest('/addresses', { method: 'POST', body: JSON.stringify(payload) });
    addressForm.reset();
    addressForm.style.display = 'none';
    showBanner('Address saved.', 'success');
    loadAddresses();
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', loadAddresses);
