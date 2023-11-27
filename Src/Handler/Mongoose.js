const mongoose = require('mongoose')
const config = require('../config.json')
class Handler {


    async Connection() {


        mongoose.set('strictQuery', false)
        mongoose.connect(

            config.API.mongokey,

        )
        .then(x => console.log(`[ Database ] - Başarılı bir şekilde veritabanı erişimi sağlandı.`))
        .catch(() => console.log(`[ Database ] - Veritabanına erişim sağlanamadı.`))
    }

}

module.exports = new Handler()