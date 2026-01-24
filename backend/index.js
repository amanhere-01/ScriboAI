require("dotenv").config();
const express = require('express');
const app = express();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user.js");
const docsRouter = require("./routes/docs.js");
const askaiRouter = require("./routes/askai.js");
const { checkAuthentication, checkAuthorization } = require('./middlewares/authorization.js');
const cookieParser = require("cookie-parser");
const cors = require('cors');


const PORT = 2121;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


app.get('/', (req,res) => {
  res.send('hello from server niggesh');
})


app.use('/auth', authRouter);

app.use(checkAuthentication);

app.use('/user', userRouter);
app.use('/doc', docsRouter);
app.use('/ai', askaiRouter);






app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})