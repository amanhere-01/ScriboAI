require("dotenv").config();
const express = require('express');
const app = express();

const rateLimit = require("express-rate-limit");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user.js");
const docsRouter = require("./routes/docs.js");
const askaiRouter = require("./routes/askai.js");
const folderRouter = require("./routes/folder.js");

const { checkAuthentication, checkAuthorization } = require('./middlewares/authorization.js');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const PORT = process.env.PORT || 2121;


const authLimiter = rateLimit({
  windowMs: 5*60*1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many login attempts. Try again later"
    });
  }
});

const aiLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user?.id) {
      return req.user.id;   
    }
    return rateLimit.ipKeyGenerator(req, res); 
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "AI request limit exceeded. Please wait."
    });
  }
});


app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    // "https://scriboai.vercel.app", // future prod
  ],
  credentials: true
}));

app.get('/', (req,res) => {
  res.send('hello from server');
})

app.use("/auth", authLimiter);
app.use('/auth', authRouter);

app.use(checkAuthentication);

app.use("/ai", aiLimiter);
app.use('/ai', askaiRouter);




app.use('/user', userRouter);
app.use('/f', folderRouter);
app.use('/docs', docsRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})