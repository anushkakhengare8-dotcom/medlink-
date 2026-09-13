// ==========================================================================
// MedLink — dashboard.js
// Fills the stat cards and Recent Orders panel with real data, worded
// differently for a pharmacy owner (buyer) vs a distributor (seller).
// ==========================================================================

function formatMoney(value) {
  return '₹' + Number(value).toFixed(2);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const badgeClass = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  SHIPPED: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
};

async function loadDashboard() {
  const user = getUser();
  const isDistributor = user && user.role === 'DISTRIBUTOR';

  if (isDistributor) {
    document.getElementById('statMoneyLabel').textContent = 'Total earned';
  }

  try {
    const orders = await apiRequest('/orders');

    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const inTransit = orders.filter(o => o.status === 'SHIPPED').length;
    const moneyTotal = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    document.getElementById('statTotalOrders').textContent = total;
    document.getElementById('statTotalOrdersSub').textContent = total ? `${total} order${total === 1 ? '' : 's'} total` : 'No orders yet';

    document.getElementById('statPending').textContent = pending;
    document.getElementById('statPendingSub').textContent = pending ? 'Awaiting confirmation' : 'Nothing awaiting confirmation';

    document.getElementById('statTransit').textContent = inTransit;
    document.getElementById('statTransitSub').textContent = inTransit ? 'On the way' : 'No shipments on the way';

    document.getElementById('statMoney').textContent = formatMoney(moneyTotal);
    document.getElementById('statMoneySub').textContent = total
      ? (isDistributor ? 'Across all received orders' : 'Across all your orders')
      : 'This account is new';

    // Recent orders — top 5, backend already sorts newest first.
    const list = document.getElementById('recentOrdersList');
    const empty = document.getElementById('recentOrdersEmpty');

    if (!orders.length) {
      list.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    list.style.display = 'block';
    empty.style.display = 'none';

    list.innerHTML = orders.slice(0, 5).map(order => {
      const itemsSummary = order.items.map(i => i.medicine.name).join(', ');
      return `
        <div class="item-row">
          <div>
            <div class="item-row__main">${itemsSummary}</div>
            <div class="item-row__sub">#${order.id.slice(0, 8)} · ${formatDate(order.createdAt)} · ${formatMoney(order.totalAmount)}</div>
          </div>
          <span class="badge ${badgeClass[order.status] || 'badge-info'}">${order.status}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    // Leave the default placeholders in place if the fetch fails — no need
    // to break the dashboard for a background stat error.
    console.error('Dashboard stats failed to load:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
