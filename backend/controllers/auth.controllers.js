import bcryptjs from "bcryptjs";

import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js";
import User from "../models/user.model.js";

const toSafeUser = (user) => ({
    ...user._doc,
    password: undefined,
});

export const register = async (req, res) => {
    try{
        const { email, password, name } = req.body || {};
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const trimmedName = String(name || "").trim();

        if (!normalizedEmail || !password || !trimmedName) {
            throw new Error("All the fields are required!");
        }

        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long!");
        }

        const userAlreadyExist = await User.findOne({ email: normalizedEmail });
        if (userAlreadyExist) {
            throw new Error("User already exists!");
        }

        const hashedPassword = await bcryptjs.hash(password, 12);
        const user = new User({
            email: normalizedEmail,
            password: hashedPassword,
            name: trimmedName,
        });

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            success: true,
            message: "Successfully registered!",
            user: toSafeUser(user),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body || {};

    try {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        if(!normalizedEmail || !password){
            throw new Error("Email and password are required!");
        }

        const user = await User.findOne({email: normalizedEmail});
        if(!user){
            throw new Error("Invalid email!");
        }

        const isPasswordVaild = await bcryptjs.compare(password, user.password);
        if(!isPasswordVaild){
            throw new Error("Invalid password!");
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: "Successfully logged in!",
            user: toSafeUser(user),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    res.clearCookie('auth_token');
    res.status(200).json({
        success: true,
        message: "Logged out successfully!",
        user: null,
    });
}

export const checkAuth = async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        if(!user){
            throw new Error("Invalid or expired user!");
        }

        res.status(200).json({
            success: true,
            message: "Authenticated user fetched successfully!",
            user: toSafeUser(user),
        });
    } catch (error){
        res.status(400).json({ success: false, message: error.message });
    }
}
