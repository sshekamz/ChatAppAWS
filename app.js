const path = require('path');
const fs = require('fs');

const express = require('express');

const cors = require('cors');
//const helmet = require('helmet');
const morgan = require('morgan');

const dotenv = require('dotenv');
dotenv.config();

//database
const sequelize = require('./util/database');
//routes
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const groupRoutes=require('./routes/group');
//models
const User = require('./models/user');
const Chat=require('./models/chat')
const Group=require('./models/group');
const UserGroup=require('./models/usergroup');

const app = express();

app.use(express.json());
app.use(cors());
//app.use(helmet());

//routes
app.use('/admin', adminRoutes);
app.use(chatRoutes);
app.use(groupRoutes);

app.use((req,res,next)=>{
    //console.log(path.join(__dirname, `./frontend/${req.url}`));
    res.sendFile(path.join(__dirname, `./frontend/${req.url}`))
})

//associations
User.hasMany(Chat);
Chat.belongsTo(User);

Group.belongsToMany(User,{through:UserGroup});
User.belongsToMany(Group,{through:UserGroup});

Group.hasMany(Chat);
Chat.belongsTo(Group);

sequelize.sync({
    // force: true
}).then(() => {
    app.listen(process.env.PORT || 4000,);
}).catch(err => {
    console.log(err);
})