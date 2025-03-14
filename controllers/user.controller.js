import Users from '../services/user.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const user = new Users();

export const RegisterUser = async ( req, res, next ) => {
    try {
        const { name, gender, age, email, password, role_name } = req.body;
        const role_id = await user.getRole_id(role_name);
        await user.createUser(name, gender, age, email, password, role_id);
        res.json({ status: true, message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
};

export const getRole_id = async (req, res, next) => {
    try{
        const { role_name } = req.body;
        const role_id = await user.getRole_id(role_name);
        res.json({ status: true, role_id });
    }
    catch (err) {
        next(err);
    }

};

export const Login = async(req, res, next) => {
    try{

        const {email, password} = req.body;
        console.log(email, password);
        const userAuth = await user.findUser(email);
        // const match = await bycrypt.compare(password, use.password);
        const match = password === use.password;  
        if (!match) {
            throw new Error('Invalid email or password.');
            }
        const token = jwt.sign({ user_id: userAuth.user_id, role_id: userAuth.role_id, email: userAuth.email  }, 'schoolstudenthelpline', { expiresIn: '1h' });
        
        res.json({ status: true, message: 'User logged in successfully', userAuth, token });
    }
    catch (err) {
        next(err);
    }
}