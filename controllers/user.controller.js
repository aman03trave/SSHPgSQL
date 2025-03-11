import Users from '../services/user.service.js';

const user = new Users();

export const RegisterUser = async ( req, res, next ) => {
    try {
        const { name, email, password } = req.body;
        await user.createUser(name, email, password);
        res.json({ status: true, message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
};