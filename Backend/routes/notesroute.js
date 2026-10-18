const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controller/auth");
const {Addnotes,Getnotes,Upnotes,Deletenotes,uppin,Edit,GetOnenotes,dashboard} = require('../controller/notescont')

router.post('/addnotes',authMiddleware,Addnotes);
router.get('/getnotes',authMiddleware,Getnotes);
router.get('/notes/:id',authMiddleware,GetOnenotes);
router.put('/updatenotes/:id',authMiddleware,Upnotes);
router.delete('/deletenotes/:id',authMiddleware,Deletenotes);
router.patch('/UpPin/:id',authMiddleware,uppin);
router.patch('/edit/:id',authMiddleware,Edit);
router.get("/notes/recent", authMiddleware,dashboard) 

module.exports = router;