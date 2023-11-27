

const { Schema, model, models } = require('mongoose')
const data = new Schema({
    
    userID: String,
    links: { type: Array, default: [] },
    premium: { type: Boolean, default: false }
})

module.exports = models.LinkUsers || model("LinkUsers", data);



const linkSchema = [
    {
        projectName: "",
        projectLink: "",
        projectKey: ""
    }
]