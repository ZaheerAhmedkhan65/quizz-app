
function showNotification(message, type = 'success') {
    let notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
document.addEventListener("DOMContentLoaded", () => {
  const notificationsBtns = document.querySelectorAll('.notifications-btn');
  const notificationsContainer = document.getElementById('notifications-container');
  const notificationsMenu = document.getElementById('notifications-menu');
  const unreadCountBadges = document.querySelectorAll('.unread-count');

  let allNotifications = [];

  notificationsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      notificationsContainer.classList.toggle('open');
    });
  })

  getNotifications();

  document.getElementById('hide-container').addEventListener('click', () => {
    notificationsContainer.classList.remove('open');
  });

  document.getElementById('filter-all').addEventListener('click', () => renderNotifications(allNotifications));
  document.getElementById('filter-unread').addEventListener('click', () => renderNotifications(allNotifications.filter(n => n.status === 'unread')));
  document.getElementById('reload').addEventListener('click', getNotifications);
  document.getElementById('mark-all-read').addEventListener('click', markAllAsRead);

  // Fetch notifications
  function getNotifications() {
    fetch('/notifications/get-notifications', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        allNotifications = data;
        renderNotifications(allNotifications.filter(n => n.status === 'unread'));
        updateUnreadCount();
      })
      .catch(error => console.error('Error fetching notifications:', error));
  }

  // Render notifications in the menu
  function renderNotifications(data) {
    notificationsMenu.innerHTML = '';
    if (data.length === 0) {
      notificationsMenu.innerHTML = `
        <div class="text-center my-auto">
            <strong class="fw-bold">No new notifications yet</strong>
            <p class="p-3 text-muted">Enjoy a quiet moment for now.</p>
            <i class="bi bi-bell-slash fs-1 text-muted"></i>
        </div>
      `
      return;
    }

    data.forEach(notification => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'py-2', 'px-3', 'bg-transparent');
      li.innerHTML = `
        <div class="d-flex align-items-start mb-2">
          <div class="me-3 position-relative">
            ${notification.status === 'unread'
              ? `<div class="bg-primary-subtle rounded-circle p-1 position-absolute" style="width: 10px; height: 10px; top: 35%; left: -13px;"></div>`
              : ``}
            <i class="bi bi-bell bg-primary-subtle text-primary rounded px-2 py-1 fw-bold"></i>
          </div>
          <div class="flex-grow-1">
            <strong>${notification.title}</strong>
            <p class="text-muted mt-1 mb-0">${notification.notification_text}</p>
            <small class="text-muted">${formatTimeAgo(notification.created_at)}</small>
          </div>
        </div>
      `;

      // Mark as read on click
      li.addEventListener('click', () => {
        if (notification.status === 'unread') {
          markAsRead(notification.id);
          notification.status = 'read';
          li.querySelector('.bg-primary-subtle').remove();
        }
      });

      notificationsMenu.appendChild(li);
    });
  }

  // Format time ago
  function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  }

  // Mark single notification as read
  function markAsRead(id) {
    fetch(`/notifications/mark-as-read/${id}`, { method: 'PATCH' })
      .then(res => res.json())
      .then(() => updateUnreadCount())
      .catch(err => console.error('Error marking notification as read:', err));
  }

  // Mark all as read
  function markAllAsRead() {
    fetch(`/notifications/mark-all-read`, { method: 'PATCH' })
      .then(res => res.json())
      .then(() => getNotifications())
      .catch(err => console.error('Error marking all as read:', err));
  }

  // Update unread badge count
  function updateUnreadCount() {
    const unreadCount = allNotifications.filter(n => n.status === 'unread').length;
    unreadCount > 0 ? unreadCountBadges.forEach(badge => badge.classList.remove('d-none')) : unreadCountBadges.forEach(badge => badge.classList.add('d-none'));
    unreadCountBadges.forEach(badge => badge.textContent = unreadCount > 0 ? unreadCount : 0);
  }
});
