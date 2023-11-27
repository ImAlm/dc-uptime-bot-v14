

const { Schema, model, models } = require('mongoose')

const data = new Schema({
    
    code: String
})

module.exports = models.PremiumCodes || model("PremiumCodes", data);
