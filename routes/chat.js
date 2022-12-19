const express = require('express');

const chatRoutes=express.Router();

const multer=require('multer');
const upload= multer({dest: 'uploads/'});

const authMiddleware=require('../auth/auth');

const chatController=require('../controllers/chat');

chatRoutes.post('/post-chat',authMiddleware.verifyToken, chatController.postChat);

chatRoutes.get('/get-chats',authMiddleware.verifyToken,chatController.getChats);

chatRoutes.post('/upload', authMiddleware.verifyToken, upload.single('image'), chatController.uploadFile);

module.exports=chatRoutes;