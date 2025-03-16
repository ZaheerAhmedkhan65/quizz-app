function checkForDuplicate(infoData, inputField, type, infoDataKey, btn, message) {
    inputField.addEventListener('input', () => {
        let duplicate = infoData.some(data => inputField.value.trim().toLowerCase() === data[infoDataKey].trim().toLowerCase());
        if (duplicate) {
            inputField.classList.add('is-invalid');
            btn.disabled = true;
            showNotification(`${message} with ${type} "${inputField.value}" already exists. \n Please choose a different ${type} for this new ${message.toLowerCase()}.`);
        } else {
            inputField.classList.remove('is-invalid');
            btn.disabled = false;
        }
    });
}