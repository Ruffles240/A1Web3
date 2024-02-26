// Create express app
const express = require("express");
const app = express();



// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});

let port = 8080;
app.listen(port, () => {
  console.log("Server running at port= " + port);
  console.log("http://localhost:8080/290");
  console.log("http://localhost:8080/");
});
