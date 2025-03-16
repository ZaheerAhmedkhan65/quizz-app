const User = require('../model/User');
const Course = require('../model/Course');
const UserCourse = require('../model/UserCourse');

const userDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const progress = await UserCourse.getProgressByUserId(req.user.userId);  
        const courses = await Course.findByUserId(req.user.userId);  
        res.render('dashboard', { user, courses, progress, title:"Dashboard" });
    } catch (err) {
        console.error(err); 
    }
};

module.exports = { userDashboard };