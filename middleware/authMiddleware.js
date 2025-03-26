import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies.accessToken; // Get token from cookie

        if (!token) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ status: false, message: 'Invalid token' });
            }

            req.user = decoded; // Attach user info to request
            next();
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Server error' });
    }
};
