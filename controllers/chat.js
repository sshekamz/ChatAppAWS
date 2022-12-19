const { Op } = require('sequelize');

const S3Service= require('../services/S3service');

const Chat = require('../models/chat');

exports.postChat = (req, res) => {
    const { message, name, groupId } = req.body;

        req.user.createChat({ message, name, groupId })
        .then(chat => {
            res.status(201).json({ success: true, message: 'Group message sent', chat });
        })
        .catch(err => {
            console.log(err);
            res.status(403).json({ success: false, message: 'something went wrong' });
        })
}

exports.getChats = async (req, res) => {
    try {
        const lastId = req.query.id;
        const gId = req.query.gId;
        const chat = await Chat.findAll({ where: { id: { [Op.gt]: lastId } , groupId:gId} });
        res.status(200).json({ success: true, chat });
    } catch (err) {
        console.log(err)
    }
}

exports.uploadFile= async(req, res)=>{
    try{
        console.log(req.file)
        const filename= `user-${req.user.id}/${req.file.filename}_${new Date()}.png`;
        // console.log(filename)
        const fileURL= await S3Service.uploadToS3(req.file.path, filename);
        res.status(200).json({success: true, fileURL});
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
}