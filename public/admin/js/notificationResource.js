(function ($) {
  'use strict';

  $(function () {
    // Load notifications on page load
    function loadNotifications() {
      $.ajax({
        url: '/api/notifications/get-notifications', // Replace with your actual endpoint
        method: 'GET',
        success: function (notifications) {
          $('#notification-container').empty(); // Clear existing content
          notifications.forEach(notification => {
            $('#notification-container').append(`
              <div class="preview-item border-bottom">
                <div class="preview-thumbnail position-relative">
                  <img src="${notification.avatar}" alt="image" class="rounded-circle" />
                  ${notification.status == 'unread' ? '<div class="notification unread">unread</div>' : '<div class="notification read">read</div>'}
                </div>
                <div class="preview-item-content d-flex flex-grow">
                  <div class="flex-grow">
                    <div class="d-flex d-xl-flex justify-content-between">
                      <h6 class="preview-subject">${notification.username}</h6>
                      <p class="text-muted text-small">${formatTimeAgo(notification.created_at)}</p>
                    </div>
                    <strong class="font-weight-medium text-muted">${notification.title}</strong>
                    <p class="text-muted mt-1">${notification.notification_text}</p>
                  </div>
                </div>
              </div>
            `);
          });
        },
        error: function (err) {
          console.error('Failed to load notifications:', err);
        }
      });
    }

    // Call load function on DOM ready
    loadNotifications();

    // Optional: Format timestamp (simplified)
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
        if (count > 0) {
          return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
        }
      }
      return 'Just now';
    }
  });
})(jQuery);

function showAlert(message, type = 'success') {
    let notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}