const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mediaRoutes = require('./routes/media');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/media', mediaRoutes);

app.get("/",(req,res)=>{
    res.send("API running")
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
