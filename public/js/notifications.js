function showNotification(message) {
    let notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerText = message;
    notification.style.position = 'absolute';
    notification.style.top = '65px';
    notification.style.right = '10px';
    notification.style.zIndex = '9999';
    notification.style.padding = '10px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
