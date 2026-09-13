// ==========================================================================
// MedLink — orders.js
// Powers orders.html. Pharmacy owners see who they bought from; distributors
// see who bought from them, plus a way to move the order forward.
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

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const badgeClass = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  SHIPPED: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
};

const NEXT_STATUS = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

const user = getUser();
const isDistributor = user && user.role === 'DISTRIBUTOR';

document.addEventListener('DOMContentLoaded', () => {
  if (isDistributor) {
    document.getElementById('partyColumn').textContent = 'Buyer';
    document.getElementById('newOrderBtn').style.display = 'none';
    document.getElementById('ordersPageTitle').textContent = 'Orders Received';
    document.getElementById('ordersPageSubtitle').textContent =
      'Orders placed by pharmacy owners for medicines in your catalog show up here, with live status.';
    document.getElementById('ordersEmptyTitle').textContent = 'No orders yet';
    document.getElementById('ordersEmptyText').textContent =
      'Orders from pharmacy owners will show up here as soon as someone buys from your catalog.';
    const actionBtn = document.getElementById('ordersEmptyAction');
    actionBtn.href = 'search-medicines.html';
    actionBtn.innerHTML = '<i class="ti ti-plus"></i> Add more medicines to your catalog';
    document.getElementById('addressColumn').style.display = '';
  }
  loadOrders();
});

async function loadOrders() {
  const table = document.getElementById('ordersTable');
  const body = document.getElementById('ordersBody');
  const empty = document.getElementById('ordersEmptyState');

  try {
    const orders = await apiRequest('/orders');

    if (!orders.length) {
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    body.innerHTML = orders.map(order => {
      const itemsSummary = order.items.map(i => `${i.medicine.name} × ${i.quantity}`).join(', ');
      const party = isDistributor
        ? (order.buyer ? order.buyer.businessName : '—')
        : [...new Set(order.items.map(i => i.medicine.distributor ? i.medicine.distributor.businessName : ''))].filter(Boolean).join(', ') || '—';

      const nextStatus = NEXT_STATUS[order.status];
      const actionCell = isDistributor && nextStatus
        ? `<button class="btn-secondary" type="button" data-order="${order.id}" data-next="${nextStatus}">Mark ${nextStatus.toLowerCase()}</button>`
        : '';
      const addressCell = isDistributor
        ? `<td>${order.deliveryAddress || '—'}</td>`
        : '';

      return `
        <tr>
          <td>#${order.id.slice(0, 8)}</td>
          <td>${itemsSummary}</td>
          <td>${party}</td>
          ${addressCell}
          <td>${formatDate(order.createdAt)}</td>
          <td>${formatMoney(order.totalAmount)}</td>
          <td>
            <span class="badge ${badgeClass[order.status] || 'badge-info'}">${order.status}</span>
            ${actionCell}
          </td>
        </tr>
      `;
    }).join('');

    body.querySelectorAll('button[data-order]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await apiRequest(`/orders/${btn.dataset.order}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: btn.dataset.next }),
          });
          showBanner('Order status updated.', 'success');
          loadOrders();
        } catch (err) {
          showBanner(err.message, 'error');
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    showBanner(err.message, 'error');
  }
}
