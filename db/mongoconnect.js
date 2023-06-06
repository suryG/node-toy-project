// getting-started.js
const mongoose = require('mongoose');
const {config}=require('../config/secret')
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster1.0bahop8.mongodb.net/monkey23`);

}