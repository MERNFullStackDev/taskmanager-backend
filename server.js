const express = require('express');
const { check } = require("express-validator");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const userRoutes = require('./routes/user-routes');
const taskRoutes = require('./routes/task-routes');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
  });

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Error Handling
app.use((req, res, next) => {
    throw new HttpError("Unsupported Route found", 404);
});

  app.use((error, req, res, next) => {   
    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "There is unknown Error Occurs!" });
  });


mongoose.connect('mongodb+srv://kambojmail:Diamond123@cluster0.stpqepl.mongodb.net/taskmanager?retryWrites=true&w=majority')
.then(() => {
    // Start the server
    app.listen(5000, () => {
        console.log('Server is running on port 5000');
    });
}).catch(() => {
    console.log('Connection failed!');
});

