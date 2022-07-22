const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const allRoutes = require('./Routes/allRoutes');
// const connectionDB = require('./db');


dotenv.config({path : './config.env'});

// connectionDB();

const app = express();
app.use(express.json())

app.use(cors())
app.options('*' , cors())



app.use('/api' , allRoutes);
app.use('/uploads' , express.static('uploads') )

const port =  process.env.PORT ||  8080;

app.get('/', (req, res) => res.send('Hello World'))


app.listen(port , () => console.log(`Server is running in ${process.env.APP_ENV} mode on port ${port}`) )