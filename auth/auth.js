const jwt = require('jsonwebtoken');

const User = require('../models/user');

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

//verify token
exports.verifyToken = async (req, res, next) => {
    try {
        //get auth header value
        const bearerHeader = req.headers['authorization'];
        //check if bearer is undefined
        if(typeof bearerHeader!= 'undefined'){
            //split at space
            const bearer=bearerHeader.split(' ');
            //get the token from array
            const bearerToken=bearer[1];
            //verify token
            const userId = Number(jwt.verify(bearerToken, process.env.TOKEN_SECRET));
            const user= await User.findByPk(userId);    
            req.user = user;
            //next middleware
            next();
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(401);
    }
}