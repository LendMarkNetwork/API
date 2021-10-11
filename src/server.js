const express = require("express");
const fs = require('fs');
const MySQL = require('./managers/MySQL');
const format = require("./managers/Formatter");

class Server {
    constructor() {
        this.app = express();
        this.app.format = format;

        this.routes = new Map();
        this.mysql = new MySQL();

        this.loadRoutes();
        this.route();

        this.app.listen(80);
    }

    loadRoutes() {
        let dir = fs.readdirSync(`${__dirname}/routes/`).filter(f => f !== "Base.js");
        for(let route of dir) {
            const file = new(require(`./routes/${route}`));
            this.routes.set(file.name, file);
        }
    
        return true;
    }

    route() {
        this.app.get('/', (req, res) => {
            this.app.format(req, res, {
                status: '200',
                statusText: 'OK'
            })
        })
        
        this.app.get(`/api/v1/*`, (req, res) => {
            let url = req.url.slice(8).split('?')[0];
            this.routes.get(url).run({
                app: this.app,
                mysql: this.mysql,
                format: (data, status = 200) => this.app.format(req, res, data, status),
                query: req.query,
                req,
                res
            });
        });
    }
}

module.exports = Server;