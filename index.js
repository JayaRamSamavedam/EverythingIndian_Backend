import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }))

// Configure Helmet for strong security
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    }
}));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.xssFilter());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// CORS configuration
const corsOptions = {
    origin:["https://reimagined-fishstick-sigma.vercel.app","http://localhost:5000","http://localhost:5173"], // specify your allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Import your database connection
import './db/connection.js';

// Import your routes
import userrouter from './routes/userroutes.js';
// import productrouter from './routes/productroutes.js';

app.use(userrouter);
import productrouter from "./routes/productroutes.js"
app.use(productrouter);
import cartrouter from "./routes/cartroutes.js";
app.use(cartrouter);
import adminrouter from "./routes/adminroutes.js";
app.use(adminrouter);
const PORT = process.env.PORT || 4002;
app.get("/", (req, res) => res.send("Express on Vercel"));
app.listen(PORT, () => {
    console.log(`Server start at Port No: ${PORT}`);
});
