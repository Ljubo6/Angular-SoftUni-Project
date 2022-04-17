const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')

module.exports.login = async function (req,res){
    const candidate = await User.findOne({email:req.body.email})

    if(candidate){
        //Check password,user exists
        const passwordResult = bcrypt.compareSync(req.body.password,candidate.password)
        if(passwordResult){
            //Generate token,passwords matched
            const token = jwt.sign({
                email:candidate.email,
                userId:candidate._id
            },keys.jwt,{expiresIn: 60 * 60})
            res.status(200).json({
                token:`Bearer ${token}`
            })
        }else{
            //Passwords didn't match
            res.status(401).json({
                message:'Passwords didn\'t match.Try again!'
            })
        }
    }else{
        //User doesn't exists,error
        res.status(404).json({
            message:'User with this email it\'s not found'
        })
    }
}

module.exports.register = async function(req,res){
    //email password
    const candidate = await User.findOne({email:req.body.email})

    if(candidate){
        //User exists - send an error
        res.status(409).json({
            message:'This email already exist.Take another one!'
        })
    }else{
        //Create user
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password,salt)
        })
        try{
            await user.save()
            res.status(201).json(user)
        }catch(e){
            errorHandler(res,e)
        }

    }
}