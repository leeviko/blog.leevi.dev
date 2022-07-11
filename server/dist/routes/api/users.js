"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = require("crypto");
const nanoid_1 = require("nanoid");
const express_validator_1 = require("express-validator");
const db_1 = __importDefault(require("../../config/db"));
const router = express_1.default.Router();
/**
 * @route  POST api/users
 * @desc   Create new user
 * @access Public
 */
router.post("/", [
    (0, express_validator_1.body)("username").escape().trim().isLength({ min: 3, max: 50 }),
    (0, express_validator_1.body)("password").escape().trim(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ msg: "Username or password cannot be empty" });
    }
    // Check if user already exists
    const sql = "SELECT name FROM users WHERE name = $1 LIMIT 1";
    const userExists = yield db_1.default.query(sql, [username]);
    if (userExists.rowCount === 1) {
        return res.status(400).json({ msg: "Username is already in use" });
    }
    // generate random 16 bytes long salt
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    (0, crypto_1.scrypt)(password, salt, 32, (err, derivedKey) => {
        if (err)
            return res
                .status(400)
                .json({ msg: "Something went wrong while registering" });
        const hash = salt + ":" + derivedKey.toString("hex");
        const id = (0, nanoid_1.nanoid)();
        const query = {
            name: "create-user",
            text: "INSERT INTO users (id, name, password) VALUES ($1, $2, $3)",
            values: [id, username, hash],
        };
        db_1.default.query(query, (err, result) => {
            if (err) {
                switch (err.code) {
                    case "23505":
                        return res.status(400).json({ msg: "Username already in use" });
                    default:
                        return res
                            .status(400)
                            .json({ msg: "Something went wrong while registering" });
                }
            }
            if (result.rowCount === 0) {
                return res
                    .status(400)
                    .json({ msg: "Something went wrong while registering" });
            }
            const user = {
                id,
                username,
                createdat: new Date(),
            };
            req.session.user = user;
            return res.json(user);
        });
    });
}));
/**
 * @route  POST api/users/login
 * @desc   Login user
 * @access Public
 */
router.post("/login", [
    (0, express_validator_1.body)("username").escape().trim().isLength({ min: 3, max: 50 }),
    (0, express_validator_1.body)("password").escape().trim(),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ msg: "Username or password cannot be empty" });
    }
    const query = {
        name: "get-user-by-username",
        text: "SELECT * FROM users WHERE name = $1",
        values: [username],
    };
    db_1.default.query(query, (err, result) => {
        if (err) {
            return res.status(400).json({ msg: "Something went wrong" });
        }
        if (result.rowCount == 0) {
            return res.status(400).json({ msg: "Wrong email or password" });
        }
        const user = result.rows[0];
        const [salt, key] = user.password.split(":");
        (0, crypto_1.scrypt)(password, salt, 32, (err, derivedKey) => {
            if (err) {
                return res.status(400).json({ msg: "Something went wrong" });
            }
            if (key !== derivedKey.toString("hex")) {
                return res.status(400).json({ msg: "Wrong username or password" });
            }
            const userObj = {
                id: user.id,
                username: user.name,
                createdat: user.createdat,
            };
            req.session.user = userObj;
            return res.json(Object.assign(Object.assign({}, userObj), { description: user.description }));
        });
    });
});
/**
 * @route  POST api/users/logout
 * @desc   Logout user
 * @access Public
 */
router.delete("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res
                .status(400)
                .json({ msg: "Something went wrong while logging out" });
        }
        res.json({ msg: "Logged out" });
    });
});
module.exports = router;
