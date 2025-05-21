const User = require('../model/User');
const Course = require('../model/Course');
const UserCourse = require('../model/UserCourse');
const ChatHistory = require('../model/ChatHistory');

const userDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const courses = await Course.findByUserId(req.user.userId);
        const progress = await UserCourse.getProgressByUserId(req.user.userId);
        
        // Get stats using the new methods
        const overallProgress = await UserCourse.getAverageProgress(req.user.userId);
        const completedCourses = await Course.getCompletedCourseCount(req.user.userId);
        console.log('route : ',  req.path );
        res.render('dashboard', { 
            user, 
            courses, 
            progress, 
            title: "Dashboard",
            overallProgress: Math.round(overallProgress),
            completedCourses,
            message: null ,
            path: req.path 
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            message: "Error loading dashboard",
            error: err 
        });
    }
};

const adminDashboard = async (req, res) => {
    try {
        const users = await User.getAllUsers(req.user.userId);
        const currentUser = await User.findById(req.user.userId);
        const userStats = await User.getUserStats();
        const chatHistory = await ChatHistory.getFeedbackSummaryNormalized();
        res.render('admin/dashboard', { users,userStats,chatHistory, title:"Admin Dashboard", message: null, user: currentUser });
    } catch (err) {
        console.error(err); 
    }
};
const updateUserStatus = async (req, res) => {
    try {
        const { action } = req.params;
        const statusMap = {
            'delete': 'deleted',
            'block': 'blocked',
            'approve': 'approved'
        };
        
        if (!statusMap[action]) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }
        
        await User.updateStatus(req.params.id, statusMap[action]);
        res.status(200).json({ 
            success: true, 
            message: `User ${statusMap[action]} successfully`,
            newStatus: statusMap[action]
        });
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { userDashboard, adminDashboard, updateUserStatus };