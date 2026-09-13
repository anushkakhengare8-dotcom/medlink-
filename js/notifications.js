// ==========================================================================
// MedLink — notifications.js
// ==========================================================================

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function loadNotifications() {
  const list = document.getElementById('notificationsList');
  const empty = document.getElementById('notificationsEmptyState');

  try {
    const notifications = await apiRequest('/notifications');

    if (!notifications.length) {
      list.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    list.style.display = 'block';
    empty.style.display = 'none';

    list.innerHTML = notifications.map(n => `
      <div class="item-row" data-id="${n.id}" style="cursor:pointer; ${n.read ? 'opacity:0.6;' : ''}">
        <div>
          <div class="item-row__main">${n.read ? '' : '<i class="ti ti-point-filled" style="color:var(--primary); font-size:10px;"></i> '}${n.message}</div>
          <div class="item-row__sub">${timeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.item-row').forEach(row => {
      row.addEventListener('click', async () => {
        try {
          await apiRequest(`/notifications/${row.dataset.id}/read`, { method: 'PATCH' });
          loadNotifications();
        } catch (err) {
          // Non-critical — ignore if it fails, no need to interrupt the user.
        }
      });
    });
  } catch (err) {
    empty.querySelector('h3').textContent = 'Could not load notifications';
    empty.querySelector('p').textContent = err.message;
    list.style.display = 'none';
    empty.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', loadNotifications);
