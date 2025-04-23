function showNotification(message, type='success') {
    let notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


const notificationContainer = document.querySelector('.notification');
if (notificationContainer) {
    setTimeout(() => {
        notificationContainer.remove();
    }, 3000);
}