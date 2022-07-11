"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const auth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(404).json({ msg: "Something went wrong" });
    }
    next();
};
exports.auth = auth;
