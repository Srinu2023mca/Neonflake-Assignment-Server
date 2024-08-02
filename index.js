
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mediaRouter = require('./routes/media');

const app = express();


app.use(cors(
    {
        origin:"*",
        methods:["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
    
app.use(express.json());
app.use('/api/media', mediaRouter);

app.get("/",(req,res)=>{
    res.send("API running")
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
