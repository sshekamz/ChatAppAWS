const {Op, where}= require('sequelize');

const Group = require('../models/group');
const User = require('../models/user');
const UserGroup = require('../models/usergroup');
const Chat = require('../models/chat');

exports.createGroup = async (req, res) => {
    try{
        const { name, isAdmin } = req.body;
        // console.log(req.body)
        const group= await req.user.createGroup({ name });
        const groupuser = await UserGroup.update({isAdmin},{where:{groupId:group.id}});
        res.status(201).json({ message: 'created successfully', group});      
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'server error' });
    }
        
}

exports.deleteGroup=async (req,res)=>{
    try{
        const gId=req.params.gId;
        // console.log('>>>>>',gId)

        //for checking current user if admin
        const adminCheck= await UserGroup.findOne({where:{userId:req.user.id,groupId:gId}});
        // console.log(adminCheck);
        if(adminCheck.isAdmin === false){
            return res.status(400).json({message:"You are not an admin"});
        }

        const chats= await Chat.findAll({attributes:['id'],where:{groupId:gId}});
        let array=[];
        chats.forEach(chat=>{
            array.push(chat.id);
        })
        await Chat.destroy({where:{id:array}});
        await Group.destroy({where:{id:gId}});
        res.status(200).json({message:'successfully deleted'});
    }catch(err){
        console.log(err);
        res.status(500);
    }      
}

exports.getGroups = (req, res) => {
    
    req.user.getGroups({attributes:['id','name']})
        .then(groups => {
            res.status(200).json({success:true,groups});
        }).catch(err => {
            console.log(err);
            res.status(500).json({ message: 'server error' });
        })
}

exports.getUsers = async (req,res) => {
    try {
        const gId= req.query.gId;
        if(gId != null){
            const ress= await UserGroup.findAll({attributes:['userId'],where:{groupId:gId}});
            // console.log(ress)
            let userIdArray=[];
            ress.forEach(id=>{
                userIdArray.push(id.userId);
            })
            // console.log(userIdArray);
            const userData= await User.findAll({attributes:['id','name','email'],include:[{model:Group, where:{id:gId}}],where:{id:userIdArray}});
            // console.log(userData);
            res.status(200).json({userData})
        }else if(gId == null){
            const user = await User.findAll({attributes:['id','name','email'],where:{id:{[Op.ne]:req.user.id}}});
            // console.log(user)
            res.status(200).json({success:true,user});
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({success:false, message: 'error' });
    }
}

exports.addUserToGroup = async(req, res) => {
    try{
        const { groupId, email, isAdmin } = req.body;
        // console.log(req.body)

        //for checking current user if admin
        const adminCheck= await UserGroup.findOne({where:{userId:req.user.id,groupId:groupId}});
        // console.log(adminCheck);
        if(adminCheck.isAdmin === false){
            return res.status(400).json({message:"You are not an admin"});
        }
        
        // for adding users to group
        const userToAdd=await User.findOne({ where: { email } })
        const userGroup=await UserGroup.create({userId:userToAdd.id,groupId:groupId});
        if(isAdmin === true){
            await UserGroup.update({isAdmin:isAdmin},{where:{userId:userToAdd.id,groupId:groupId}});
        }
        res.status(201).json({message:'added user to the group',userGroup});   
        
    }catch(err){
        console.log(err);
        res.status(404).json({message:'user already in group'});
        // res.sendStatus(500);
    }
}

exports.removeUser = async(req,res)=>{
    try{
        const { groupId, email } = req.body;
        console.log(req.body)

        //for checking current user if admin
        const adminCheck= await UserGroup.findOne({where:{userId:req.user.id,groupId:groupId}});
        // console.log(adminCheck);
        if(adminCheck.isAdmin === false){
            return res.status(400).json({message:"You are not an admin"});
        }

        const userToRemove=await User.findOne({ where: { email } })
        // console.log(userToRemove)
        const result= await UserGroup.destroy({where:{userId:userToRemove.id,groupId:groupId}});
        // console.log('>>>>>>',result)
        if(result==0) return res.status(404).json({message:'User not present in the group'});
        res.status(200).json({message:'User removed from the group'});
        
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

exports.makeAdmin=async(req,res)=>{
    try{
        const {email, groupId}= req.body;
        const user= await User.findOne({where:{email:email}});
        await UserGroup.update({isAdmin:true},{where:{userId:user.id,groupId:groupId}});
        res.status(200).json({message:"user is now admin"})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:err});
    }
}
