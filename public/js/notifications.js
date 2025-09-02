const notificationContainer = document.querySelector('.notification');
const notificationList = document.querySelector('#notificationList');

function showNotification(message, type = 'success') {
    let notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotifications() {
    fetch('/api/notifications/get-notifications')
        .then(response => response.json())
        .then(data => {
            notificationList.innerHTML = '';
            data.forEach(notification => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `
                <div class="d-flex align-items-center gap-2 mb-1">
                    <strong class="thumbnail">QuizApp</strong>
                    <div class="d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between">
                            <strong class="me-2">${notification.title}</strong>
                            <small class="text-muted" style="font-size:12px;">${formatTimeAgo(notification.created_at)}</small>
                        </div>
                        <span class="text-muted" style="width: 200px;text-overflow: hidden;white-space: nowrap;overflow: hidden;">${notification.notification_text}</span>
                    </div>
                </div>
                <hr>
            `;
                notificationList.appendChild(li);
            })
        })
        .catch(error => console.error('Error fetching notifications:', error));
}

if (notificationContainer) {
    setTimeout(() => {
        notificationContainer.remove();
    }, 3000);
}


const getNotificationsBtn = document.querySelector('#get-notifications');
if (getNotificationsBtn) {
    getNotificationsBtn.addEventListener('click', () => {
        if (notificationList.style.display == 'block') {
            notificationList.style.display = 'none';
        } else {
            notificationList.style.display = 'block';
        }
    });
}

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

document.addEventListener("DOMContentLoaded", ()=>{
    if(getNotificationsBtn && notificationList && notificationContainer){
        getNotifications();
    }
});
