// ==========================================================================
// MedLink — invoices.js
// ==========================================================================

function formatMoney(value) {
  return '₹' + Number(value).toFixed(2);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadInvoices() {
  const table = document.getElementById('invoicesTable');
  const body = document.getElementById('invoicesBody');
  const empty = document.getElementById('invoicesEmptyState');

  try {
    const invoices = await apiRequest('/invoices');

    if (!invoices.length) {
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    body.innerHTML = invoices.map(inv => `
      <tr>
        <td>#${inv.id.slice(0, 8)}</td>
        <td>#${inv.orderId.slice(0, 8)}</td>
        <td>${formatDate(inv.issuedAt)}</td>
        <td>${formatMoney(inv.amount)}</td>
        <td><span class="badge badge-success">Paid</span></td>
      </tr>
    `).join('');
  } catch (err) {
    empty.querySelector('h3').textContent = 'Could not load invoices';
    empty.querySelector('p').textContent = err.message;
    table.style.display = 'none';
    empty.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', loadInvoices);
