import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (UID, res) => {
    const token = jwt.sign({UID}, process.env.JWT_SECRET, 
        {
            expiresIn: '15d'
        }
    );

    res.cookie("jwt", token, {
        maxAge: 15*24*60*60*1000, // ms
        httpOnly: true, // noXSS
        sameSite: "strict", // noCSRF
        secure: process.env.NODE_ENV !== 'development',
    });
};

