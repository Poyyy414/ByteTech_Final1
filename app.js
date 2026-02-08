const express = require('express');
const bodyParser = require('body-parser');

const barangayRoutes = require('./routes/barangayRoutes');
const establishmentRoutes = require('./routes/establishmentRoutes');
const userRoutes = require('./routes/userRoutes');  



const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

app.get('/', function(req, res) {
    res.send('Welcome to the ByteTech API!');
});

app.use('/user', userRoutes);
app.use('/barangay', barangayRoutes);
app.use('/establishment', establishmentRoutes);



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
