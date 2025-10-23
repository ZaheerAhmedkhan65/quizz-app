const userScript = document.querySelector('#user');
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
  const currentUser = JSON.parse(userScript.textContent || '{}');

// 🧠 Skip notifications if user is not logged in
if (!currentUser || Object.keys(currentUser).length === 0 || !currentUser.userId) {
  console.log("No logged-in user — skipping notifications.");
  return;
}
  const notificationsBtns = document.querySelectorAll('.notifications-btn');
  const notificationsContainer = document.getElementById('notifications-container');
  const unreadCountBadges = document.querySelectorAll('.unread-count');
  const allBtn = document.getElementById('filter-all');
  const unreadBtn = document.getElementById('filter-unread');
  const reloadBtn = document.getElementById('reload');
  const markAllReadBtn = document.getElementById('mark-all-read');

  let allNotifications = [];

  notificationsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      notificationsContainer.classList.toggle('open');
    });
  })

  function setActiveButton(activeBtn) {
    [allBtn, unreadBtn].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  setActiveButton(unreadBtn);

  getNotifications();

  document.getElementById('hide-container').addEventListener('click', () => {
    notificationsContainer.classList.remove('open');
  });

  allBtn.addEventListener('click', () => {
    renderNotifications(allNotifications);
    setActiveButton(allBtn);
  });
  unreadBtn.addEventListener('click', () => {
    renderNotifications(allNotifications.filter(n => n.is_read == 0));
    setActiveButton(allBtn);
  });
  reloadBtn.addEventListener('click', ()=>{
    getNotifications();
    setActiveButton(unreadBtn);
  });
  markAllReadBtn.addEventListener('click', ()=>{
    markAllAsRead();
    setActiveButton(unreadBtn);
  });

  // Fetch notifications
  function getNotifications() {
    fetch('/notifications/get-notifications', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        allNotifications = data;
        renderNotifications(allNotifications.filter(n => n.is_read == 0));
        updateUnreadCount();
      })
      .catch(error => console.error('Error fetching notifications:', error));
  }

  function renderNotifications(data) {
    const menu = document.getElementById('notifications-menu');
    menu.innerHTML = '';
  
    if (data.length === 0) {
      menu.innerHTML = `
        <div class="text-center my-auto">
          <strong class="fw-bold">No new notifications yet</strong>
          <p class="p-3 text-muted">Enjoy a quiet moment for now.</p>
          <i class="bi bi-bell-slash fs-1 text-muted"></i>
        </div>
      `;
      return;
    }
  
    data.forEach((notification, index) => {
      const isUnread = notification.is_read == 0;
      const icon = notification.type === "user"
        ? `<div class="bg-primary-subtle rounded p-2"><i class="bi bi-bell text-primary"></i></div>`
        : `<div class="bg-success-subtle rounded p-2"><i class="bi bi-megaphone text-success"></i></div>`;
  
      const item = document.createElement('div');
      item.classList.add('accordion-item', 'bg-transparent', 'border-0', 'mb-2');
  
      item.innerHTML = `
      <h2 class="accordion-header position-relative" id="heading-${index}">
        <button class="accordion-button ${isUnread ? 'fw-bold' : 'fw-semibold'}" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapse-${index}" 
                aria-expanded="false" 
                aria-controls="collapse-${index}">
          ${icon}
          <div class="flex-grow-1 ms-2 overflow-hidden">
            <strong class="mb-0">${notification.title}</strong>
            <span class="text-truncate d-block" 
                  style="font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${notification.subtitle || ''}
            </span>
          </div>
          ${isUnread ? `<span class="bg-primary position-absolute translate-middle rounded" style="top: 50%; left: 15px; width: 10px; height: 10px;"></span>` : ''}
        </button>
      </h2>
      <div id="collapse-${index}" class="accordion-collapse collapse" aria-labelledby="heading-${index}" data-bs-parent="#notifications-menu">
        <div class="accordion-body">
          <p class="mb-1 fw-bold">${notification.title || 'No details provided.'}</p>
          <p class="mb-0">${notification.notification_text}</p>
          <small class="text-muted">${formatTimeAgo(notification.created_at)}</small>
        </div>
      </div>
    `;
    
  
      // Mark as read when expanded
      item.querySelector('.accordion-button').addEventListener('click', () => {
        if (isUnread) {
          markAsRead(notification.id);
          notification.is_read = 1;
      
          // safely remove unread dot
          const dot = item.querySelector('.accordion-button .bg-primary');
          if (dot) dot.remove();
        }
      });
  
      menu.appendChild(item);
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
    const unreadCount = allNotifications.filter(n => n.is_read == 0).length;
    unreadCount > 0 ? unreadCountBadges.forEach(badge => badge.classList.remove('d-none')) : unreadCountBadges.forEach(badge => badge.classList.add('d-none'));
    unreadCountBadges.forEach(badge => badge.textContent = unreadCount > 0 ? unreadCount : 0);
  }
});
