const User = require('../models/User');
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
const ChatHistory = require('../models/ChatHistory');
const Semester = require('../models/Semester');

const userDashboard = async (req, res) => {
    try {
        if(!req.user) {
            return res.status(404).render('error', { 
                message: "User not found",
                error: "User not found" 
            });
        }
        const currentSemester = await Semester.findByStatus('active');
        if(!currentSemester) {
            return res.status(500).render('error', { 
                message: "Error loading dashboard",
                error: "Error loading dashboard" 
            });
        }
        const courses = await Course.findByUserId(req.user.userId);
        
        let progress = await UserCourse.getProgressByUserId(req.user.userId);
        
        // Get stats using the new methods
        const overallProgress = await UserCourse.getAverageProgress(req.user.userId);
        const completedCourses = await Course.getCompletedCourseCount(req.user.userId);

        progress = progress.map(p => ({ ...p, course_progress: Math.round(p.course_progress) }));
        res.render('user/dashboard', {
            currentSemester,
            courses, 
            progress, 
            title: "Dashboard",
            overallProgress: Math.round(overallProgress),
            completedCourses,
            message: null 
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

const userProfile = async (req, res) => {
    try {
        const userInfo = await User.findById(req.user.userId);
        const semesters = await Semester.findByStatus('closed');
        res.status(200).render('user/profile', { userInfo, title: "Profile" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { userDashboard, adminDashboard, updateUserStatus, userProfile };