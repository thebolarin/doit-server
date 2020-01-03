const dotenv = require('dotenv')

dotenv.config();

export default{
    databaseUrl: process.env.MONGODB_URI || ' mongodb+srv://bolarinwa:JAlbZjlfi6P18f62@cluster0-25yze.mongodb.net/doit?retryWrites=true&w=majority',
    messagebirdKey:process.env. MESSAGEBIRD_KEY || 'Bw7YIC0EGO21xK8g9DvrciPdf'
}