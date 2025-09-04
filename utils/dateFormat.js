function formateCreatedAt(date) {
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    };
    return new Date(date).toLocaleString("en-US", options);
}

module.exports = { formateCreatedAt };