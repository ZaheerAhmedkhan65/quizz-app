(function ($) {
  'use strict';

  let currentFilter = 'all';
  let allNotifications = [];

  $(function () {
    // Load notifications on page load
    loadNotifications();

    // Set up periodic refresh (every 30 seconds)
    setInterval(loadNotifications, 1000 * 60 * 5);
  });

  // Load notifications function
  function loadNotifications() {
    $.ajax({
      url: '/notifications/get-notifications',
      method: 'GET',
      success: function (notifications) {
        allNotifications = notifications;
        renderNotifications();
      },
      error: function (err) {
        console.error('Failed to load notifications:', err);
        showAlert('Failed to load notifications', 'error');
      }
    });
  }

  // Render notifications based on current filter
  function renderNotifications() {
    let filteredNotifications = allNotifications;
    
    switch (currentFilter) {
      case 'unread':
        filteredNotifications = allNotifications.filter(notification => !notification.is_read);
        break;
      case 'global':
        filteredNotifications = allNotifications.filter(notification => notification.type === 'global');
        break;
    }

    $('#notification-container').empty();
    
    if (filteredNotifications.length === 0) {
      $('#no-notifications').show();
      $('#notification-container').hide();
    } else {
      $('#no-notifications').hide();
      $('#notification-container').show();
      
      filteredNotifications.forEach(notification => {
        const notificationElement = $(`
          <div class="preview-item border-bottom ${!notification.is_read ? 'unread-notification' : ''}" 
               data-notification-id="${notification.id}">
            <div class="preview-thumbnail position-relative">
              <img src="${notification.avatar || '/default-avatar.png'}" alt="image" class="rounded-circle" />
              ${!notification.is_read ? '<span class="badge bg-danger position-absolute top-0 start-100 translate-middle">!</span>' : '<span class="badge bg-success position-absolute top-0 start-100 translate-middle"><i class="mdi mdi-check"></i></span>'}
            </div>
            <div class="preview-item-content d-flex flex-grow">
              <div class="flex-grow">
                <div class="d-flex d-xl-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="preview-subject mb-1">
                      ${notification.type === 'global' ? '<i class="mdi mdi-earth me-1"></i> Global' : notification.username}
                      ${notification.type === 'global' ? '' : `<small class="text-muted">(@${notification.username})</small>`}
                    </h6>
                    ${notification.subtitle ? `<p class="text-primary mb-1"><small><strong>${notification.subtitle}</strong></small></p>` : ''}
                  </div>
                  <div class="text-end">
                    <p class="text-muted text-small">${formatTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
                <strong class="font-weight-medium">${notification.title}</strong>
                <p class="text-muted mt-1">${notification.notification_text}</p>
                <div class="text-muted">
                  <small>
                    <i class="mdi mdi-clock-outline"></i> 
                    ${new Date(notification.created_at).toLocaleString()}
                    ${notification.type === 'global' ? ' • <i class="mdi mdi-earth"></i> Global' : ' • <i class="mdi mdi-account"></i> User'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        `);
        
        $('#notification-container').append(notificationElement);
      });
    }
  }

  // Filter notifications
  window.filterNotifications = function(filter) {
    currentFilter = filter;
    
    // Update active button
    $('.btn-group .btn').removeClass('active');
    $(`.btn-group .btn:contains(${filter.charAt(0).toUpperCase() + filter.slice(1)})`).addClass('active');
    
    renderNotifications();
  }

  // Mark as read function
  window.markAsRead = function(notificationId) {
    $.ajax({
      url: `/notifications/mark-as-read/${notificationId}`,
      method: 'PATCH',
      success: function (response) {
        if (response.success) {
          // Update local data
          const notification = allNotifications.find(n => n.id == notificationId);
          if (notification) {
            notification.is_read = true;
          }
          renderNotifications();
          showAlert('Notification marked as read', 'success');
        }
      },
      error: function (err) {
        console.error('Failed to mark as read:', err);
        showAlert('Failed to mark as read', 'error');
      }
    });
  }

  // Mark all as read
  window.markAllAsRead = function() {
    if (!confirm('Are you sure you want to mark all notifications as read?')) {
      return;
    }
    
    $.ajax({
      url: '/notifications/mark-all-read',
      method: 'PATCH',
      success: function (response) {
        if (response.success) {
          // Update all notifications to read
          allNotifications.forEach(notification => {
            notification.is_read = true;
          });
          renderNotifications();
          showAlert('All notifications marked as read', 'success');
        }
      },
      error: function (err) {
        console.error('Failed to mark all as read:', err);
        showAlert('Failed to mark all as read', 'error');
      }
    });
  }

  // Format time ago function
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

  // Global showAlert function
  window.showAlert = function(message, type = 'success') {
    // Remove existing alerts
    $('.custom-alert').remove();
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 
                      type === 'warning' ? 'alert-warning' : 'alert-info';
    
    const alert = $(`
      <div class="alert ${alertClass} alert-dismissible fade show custom-alert position-fixed" 
           style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
        <strong>${type.charAt(0).toUpperCase() + type.slice(1)}!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);
    
    $('body').append(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      alert.alert('close');
    }, 5000);
  }

})(jQuery);