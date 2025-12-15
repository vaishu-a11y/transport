import { Request, Response } from "express";
import User from "../models/User";
import { signToken } from "../utils/auth";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email already exists" });
        const u = new User({ name, email, password, role: role || "user" });
        await u.save();
        const token = signToken({ id: u._id, role: u.role, email: u.email });
        res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "register failed" });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const u = await User.findOne({ email });
        if (!u) return res.status(401).json({ error: "Invalid credentials" });
        const match = await u.comparePassword(password);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });
        const token = signToken({ id: u._id, role: u.role, email: u.email });
        res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
    } catch (err: any) {
        res.status(500).json({ error: "login failed" });
    }
}