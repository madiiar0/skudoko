import jwt from 'jsonwebtoken';

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000
    };
};

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {expiresIn: "14d"});
    res.cookie('auth_token', token, getCookieOptions());
}

export const clearAuthCookie = (res) => {
    const { maxAge, ...cookieOptions } = getCookieOptions();
    res.clearCookie('auth_token', cookieOptions);
}
