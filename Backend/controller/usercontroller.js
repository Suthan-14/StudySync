const model = require('../model/Schema');
const taskmodel = require('../model/taskschema');
const Notification = require('../model/Notification');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const updateLoginStreak = require("./utils/streak");

require('dotenv').config();


exports.signup = async (req, res, next) => {
    try {

        const { name, email, password } = req.body;

        const hashpassword = await bcrypt.hash(password, 10);

        const user = new model({
            username: name,
            email: email,
            password: hashpassword
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: user
        });

    } catch (error) {

        res.status(500).json({
            message: "Error saving user",
            error: error.message
        });

    }
};


exports.login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        const user = await model.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "user not found"
            });
        }

        const matchpass = await bcrypt.compare(
            password,
            user.password
        );

        if (!matchpass) {
            return res.status(401).json({
                message: "invalid password"
            });
        }

        updateLoginStreak(user);

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {}
        );

        res.status(200).json({

            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastLoginDate: user.lastLoginDate
            }

        });

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

};


exports.AddTask = async (req, res, next) => {

    try {

        const {
            task,
            label,
            status,
            priority,
            startDate,
            dueDate,
            completed
        } = req.body;


        const addtask = new taskmodel({

            task,
            label,
            status,
            priority,
            startDate,
            dueDate,
            completed,

            user: req.user.userId

        });


        await addtask.save();


        // Create notification
        await Notification.create({

            user: req.user.userId,

            title: "New Task Added",

            message:
                `${addtask.task} has been added to your study plan.`,

            type: "task",

            relatedTask: addtask._id

        });


        res.status(201).json({

            message: "Task created successfully",

            task: addtask

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


exports.Gettask = async (req, res, next) => {

    try {

        const usertask = await taskmodel.find({
            user: req.user.userId
        });


        if (!usertask) {

            return res.status(401).json({
                message: 'invalid user'
            });

        }


        res.status(200).json(usertask);

    } catch (error) {

        res.status(500).json({

            message: "Error getting tasks",

            error: error.message

        });

    }

};


exports.Uptask = async (req, res, next) => {

    try {

        const { id } = req.params;


        const updatetask =
            await taskmodel.findOneAndUpdate(

                {
                    _id: id,

                    user: req.user.userId
                },

                req.body,

                {
                    new: true
                }

            );


        if (!updatetask) {

            return res.status(404).json({

                message: "Task not found"

            });

        }


        // Create notification
        await Notification.create({

            user: req.user.userId,

            title: "Task Updated",

            message:
                `${updatetask.task} has been updated.`,

            type: "task",

            relatedTask: updatetask._id

        });


        res.status(200).json({

            message: "Task updated successfully",

            task: updatetask

        });


    } catch (error) {

        console.error("Update error:", error);

        res.status(500).json({

            message: "Error updating task",

            error: error.message

        });

    }

};


exports.Completed = async (req, res, next) => {

    try {

        const { id } = req.params;

        const {
            status,
            completed
        } = req.body;


        const updatetask =
            await taskmodel.findOneAndUpdate(

                {
                    _id: id,

                    user: req.user.userId
                },

                {
                    $set: {

                        status: status,

                        completed: completed

                    }
                },

                {
                    new: true
                }

            );


        if (!updatetask) {

            return res.status(404).json({

                message: "Task not found"

            });

        }


        // Notification title and message
        const notificationTitle =
            completed
                ? "Task Completed"
                : "Task Reopened";


        const notificationMessage =
            completed

                ? `${updatetask.task} has been marked as completed.`

                : `${updatetask.task} has been marked as pending.`;


        // Create notification
        await Notification.create({

            user: req.user.userId,

            title: notificationTitle,

            message: notificationMessage,

            type: "task",

            relatedTask: updatetask._id

        });


        res.status(200).json({

            message: "Task updated successfully",

            task: updatetask

        });


    } catch (error) {

        console.error("Update error:", error);

        res.status(500).json({

            message: "Error updating task",

            error: error.message

        });

    }

};


exports.Delete = async (req, res, next) => {

    try {

        const { id } = req.params;


        const del =
            await taskmodel.findOneAndDelete({

                _id: id,

                user: req.user.userId

            });


        if (!del) {

            return res.status(401).json({

                message: "Task doesn't exist"

            });

        }


        // Create notification
        await Notification.create({

            user: req.user.userId,

            title: "Task Deleted",

            message:
                `${del.task} has been deleted from your study plan.`,

            type: "task",

            relatedTask: null

        });


        res.status(200).json({

            message: "Successfully deleted"

        });


    } catch (error) {

        res.status(500).json({

            message: "Error deleting task",

            error: error.message

        });

    }

};


exports.Streak = async (req, res) => {

    try {

        const user =
            await model.findById(req.user.userId);


        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }


        res.status(200).json({

            message: "Streak fetched successfully",

            currentStreak:
                user.currentStreak || 0,

            longestStreak:
                user.longestStreak || 0,

            lastLoginDate:
                user.lastLoginDate || null

        });


    } catch (error) {

        console.error(
            "Error fetching streak:",
            error
        );

        res.status(500).json({

            message: "Server error"

        });

    }

};

exports.googleCallback = async (req, res) => {

    try {

        const user = req.user;

        updateLoginStreak(user);

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {}
        );

        res.redirect(
            `http://localhost:5173/google-success?token=${token}`
        );

    } catch (error) {

        console.error("Google login error:", error);

        res.redirect(
            "http://localhost:5173/login?error=google_login_failed"
        );

    }

};

exports.googleUser = async (req, res) => {

    try {

        const user = await model.findById(
            req.user.userId
        );

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json({

            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                profileImage: user.profileImage,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastLoginDate: user.lastLoginDate
            }

        });

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

};