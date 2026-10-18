import { useEffect, useState } from "react";
import axios from "axios";
import notifi from "../assets/notification.svg";
import "./notification.css";

const NotificationBell = () => {

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");


  const fetchNotifications = async () => {
    try {

      const response = await axios.get(
        "http://localhost:9000/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(response.data);

      console.log(response.data);

    } catch (error) {

      console.error(
        "Error fetching notifications:",
        error
      );

    }
  };


useEffect(() => {
  fetchNotifications();

  const interval = setInterval(() => {
    fetchNotifications();
  }, 5000);

  return () => clearInterval(interval);
}, []);


  const markAsRead = async (id) => {

    try {

      await axios.put(
        `http://localhost:9000/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );


    } catch (error) {

      console.error(
        "Error marking notification as read:",
        error
      );

    }

  };


  const markAllAsRead = async () => {

    try {

      await axios.put(
        "http://localhost:9000/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );


    } catch (error) {

      console.error(
        "Error marking all notifications as read:",
        error
      );

    }

  };


  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;


  return (

    <div className="notification-wrapper">

      <button
        className="notification-button"
        onClick={() => setOpen(!open)}
      >

        <img
          src={notifi}
          alt="notification"
          className="my-svg"
        />

        {unreadCount > 0 && (

          <span className="notification-count">
            {unreadCount}
          </span>

        )}

      </button>


      {open && (

        <div className="notification-dropdown">

          <div className="notification-header">

            <h3>
              Notifications
            </h3>

            <span>
              {unreadCount} unread
            </span>

          </div>


          {notifications.length === 0 ? (

            <p className="empty-notification">
              No notifications
            </p>

          ) : (

            <div className="notification-list">

              {notifications.map(
                (notification) => (

                  <div
                    key={notification._id}
                    className={`notification-item ${
                      !notification.read
                        ? "unread"
                        : ""
                    }`}
                  >

                    <div className="notification-content">

                      <h5>
                        {notification.title}
                      </h5>

                      <p>
                        {notification.message}
                      </p>

                      <small>
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </small>

                    </div>


                    {!notification.read && (

                      <button
                        className="mark-read-button"
                        onClick={() =>
                          markAsRead(
                            notification._id
                          )
                        }
                      >
                        Mark as read
                      </button>

                    )}

                  </div>

                )
              )}

            </div>

          )}


          {notifications.length > 0 && (

            <div className="notification-footer">

              <button
                className="mark-all-read-button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>

            </div>

          )}

        </div>

      )}

    </div>

  );
};

export default NotificationBell;