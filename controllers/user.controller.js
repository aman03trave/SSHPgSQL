import Users from '../services/user.service.js';

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

export const Login = async(res, req, next) => {
    try{
        const {email, phone, password} = req.body;
        const user = await user.findUser(email, phone, password);
        res.json({status: true, message:"Logged in Successfully"});
    }
    catch (err) {
        next(err);
    }
}