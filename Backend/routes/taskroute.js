const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controller/auth");
const {AddTask,Gettask,Uptask,Delete,Completed} = require('../controller/usercontroller')

router.post('/addtask',authMiddleware,AddTask);
router.get('/gettask',authMiddleware,Gettask);
router.put('/update/:id',authMiddleware,Uptask);
router.patch('/update/:id',authMiddleware,Completed);
router.delete('/delete/:id',authMiddleware,Delete);

module.exports = router;