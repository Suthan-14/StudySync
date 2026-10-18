const updateLoginStreak = (user) => {
    const today = new Date();

    // First login
    if (!user.lastLoginDate) {
        user.currentStreak = 1;
        user.longestStreak = 1;
        user.lastLoginDate = today;

        return user;
    }

    // Get the previous login date
    const lastLogin = new Date(user.lastLoginDate);

    // Remove the time part from today's date
    const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    // Remove the time part from previous login date
    const lastLoginDate = new Date(
        lastLogin.getFullYear(),
        lastLogin.getMonth(),
        lastLogin.getDate()
    );

    // Calculate difference in days
    const difference =
        (todayDate - lastLoginDate) / (1000 * 60 * 60 * 24);

    console.log("Today:", todayDate);
    console.log("Last Login:", lastLoginDate);
    console.log("Difference:", difference);

    // Same day
    if (difference === 0) {
        return user;
    }

    // Logged in yesterday
    if (difference === 1) {
        user.currentStreak += 1;
    }

    // Missed one or more days
    else {
        user.currentStreak = 1;
    }

    // Update longest streak
    if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
    }

    // Update last login
    user.lastLoginDate = today;

    return user;
};

module.exports = updateLoginStreak;