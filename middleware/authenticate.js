const jwt = require('jsonwebtoken');
const JWT_SECRET = '2a991f724f33ef14aacc3529a2a8e5747215370b96ca9b77478d76d5733fa7ee3ae8ff9b48c3b0b062b2f838d961e66d29b9cba53119c19f468ee46290c67142';
function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).redirect('/auth/signin');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).redirect('/auth/signin');
        }
        req.user = decoded;
        next();
    });
}

module.exports = authenticate;