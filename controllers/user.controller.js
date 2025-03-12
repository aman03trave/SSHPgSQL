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