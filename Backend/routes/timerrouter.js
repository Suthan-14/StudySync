const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controller/auth");
const {timer,Gettimer} = require('../controller/timercnt');
router.get('/gettimer',authMiddleware,Gettimer);
router.put('/timer', authMiddleware, timer);

module.exports = router;