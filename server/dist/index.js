"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.set("trust proxy", 1);
const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
const redis = new ioredis_1.default(process.env.REDIS_URL);
//Configure session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: new RedisStore({ client: redis }),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days,
    },
}));
app.use("/api/users", require("./routes/api/users"));
app.listen(port, () => {
    console.log(`⚡️ Server is running on port ${port}`);
});
