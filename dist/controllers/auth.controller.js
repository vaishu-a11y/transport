"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User_1.default.findOne({ email });
        if (exists)
            return res.status(400).json({ error: "Email already exists" });
        const u = new User_1.default({ name, email, password, role: role || "user" });
        await u.save();
        const token = (0, auth_1.signToken)({ id: u._id, role: u.role, email: u.email });
        res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "register failed" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const u = await User_1.default.findOne({ email });
        if (!u)
            return res.status(401).json({ error: "Invalid credentials" });
        const match = await u.comparePassword(password);
        if (!match)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = (0, auth_1.signToken)({ id: u._id, role: u.role, email: u.email });
        res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
    }
    catch (err) {
        res.status(500).json({ error: "login failed" });
    }
};
exports.login = login;
