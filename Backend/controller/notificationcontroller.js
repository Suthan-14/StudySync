const Notification = require("../model/Notification");

const getNotifications = async (req, res) => {

  
  try {
    const notifications = await Notification.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};


const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      {
        read: true,
      }
    );

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
};


const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user.userId,
        read: false,
      },
      {
        read: true,
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};


const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
    });
  }
};


module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};