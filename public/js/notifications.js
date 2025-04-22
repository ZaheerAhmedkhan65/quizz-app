function showNotification(message, type='success') {
    let notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


const notification = document.querySelector('.notification');
if (notification) {
    setTimeout(() => {
        notification.remove();
    }, 3000);
}