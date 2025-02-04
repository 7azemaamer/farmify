import express from 'express'
import connectDB from './config/database.js';
import { errorHandler } from "./utils/errorHandling.js";
import passport from 'passport';
import session from 'express-session';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
    })
);
app.use(passport.initialize());
app.use(passport.session());


//Db Connection
connectDB();

// Routes

//app.use("/api/v1/auth", authRoutes)

//Custom Error Handling

app.use(errorHandler)

export default app 
