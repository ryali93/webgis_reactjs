const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const eeRouter = require('./routes/earth-engine');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger-doc.json');

// Create a new express application instance
const app = express();

// Enable CORS
app.use(cors());

const port = process.env.PORT || 3000;

// Start the server
app.use(express.static('public'));
app.use(bodyParser.json())

// Start the server
require('./controller/gee-authenticate')(app, port);

// Use routes
app.use('/ee', eeRouter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
