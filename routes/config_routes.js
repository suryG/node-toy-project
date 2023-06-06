const userR = require("./users");
const toyR = require("./toys");


exports.routesInit = (app) => {
    app.use("/users", userR);
    app.use("/toys", toyR);
 
}