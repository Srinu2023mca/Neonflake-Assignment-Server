require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mediaRouter = require('./routes/media');

const app = express();

app.use(cors(
    {
        origin:"*",
        methods:["GET","POST","PUT","DELETE"]
    }
));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/media', mediaRouter);

app.get("/",(req,res)=>{
    res.send("API running")
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
