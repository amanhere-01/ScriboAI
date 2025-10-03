require("dotenv").config();
const express = require('express');
const app = express();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user.js");
const docsRouter = require("./routes/docs.js");
const db = require('./configs/db.js');
const { checkAuthentication, checkAuthorization } = require('./middlewares/authorization.js');
const cookieParser = require("cookie-parser");

const PORT = 2121;

app.use(express.json());
app.use(cookieParser());



app.get('/', (req,res) => {
  res.send('hello from server niggesh');
})


app.use('/auth', authRouter);

app.use(checkAuthentication);

app.use('/user', userRouter);
app.use('/docs', docsRouter);







app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})