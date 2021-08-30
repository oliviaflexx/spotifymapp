const express = require("express");
const app = express()

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const num = 1 + 3;
    res.render('home', {num: num})
})

app.listen(8080, () => {
    console.log("LISTENING ON PORT 8080")
})

