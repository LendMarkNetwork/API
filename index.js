const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.status(200).json({
        status: '200',
        statusText: 'OK'
    })
})

app.listen(3000);