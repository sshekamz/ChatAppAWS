const express=require('express');

const groupRoutes=express.Router();

const authMiddleware=require('../auth/auth');
const groupController=require('../controllers/group');

groupRoutes.post('/create-group',authMiddleware.verifyToken,groupController.createGroup);

groupRoutes.delete('/delete-group/:gId',authMiddleware.verifyToken,groupController.deleteGroup);

groupRoutes.get('/get-groups',authMiddleware.verifyToken,groupController.getGroups);

groupRoutes.get('/get-users', authMiddleware.verifyToken,groupController.getUsers);

groupRoutes.post('/add-user',authMiddleware.verifyToken,groupController.addUserToGroup);

groupRoutes.post('/make-admin', authMiddleware.verifyToken, groupController.makeAdmin);

groupRoutes.post('/remove-user', authMiddleware.verifyToken, groupController.removeUser);

module.exports=groupRoutes;

