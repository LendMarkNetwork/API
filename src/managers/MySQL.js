require('dotenv').config();
const mysql = require('mysql');
const Logger = require('../utils/Logger');
const { playerNameToUUID } = require('../utils/Util');

class MySQL {
    constructor() {
        this.database = JSON.parse(process.env.database);
        this.createConnections();

        this.caches = {
            bentobox: new Map(),
            votes: new Map(),
            uuids: []
        }

        setTimeout(() => {
            for(let uuid of this.caches.uuids) {
                this.caches.bentobox.delete(uuid);
                this.caches.votes.delete(uuid);
            }

            this.caches.uuids = [];
        }, 600000)
    }

    async getPlayer(username, uuid) {
        const bentoBoxCache = this.caches.bentobox.get(uuid);
        const votesCache = this.caches.votes.get(uuid);

        let bentoBoxData;
        if(!bentoBoxCache) {
            this.db1.query(`USE s9_bentobox`);
            bentoBoxData = await this.db1.promisifyQuery(`SELECT * FROM Players WHERE uniqueId='"${uuid}"'`);
            if(bentoBoxData && bentoBoxData?.[0]) bentoBoxData = JSON.parse(bentoBoxData[0].json);
        } else bentoBoxData = bentoBoxCache;

        let votes = 0;
        if(!votesCache) {
            this.db1.query(`USE s2_plan`);
            let votesData = await this.db1.promisifyQuery(`SELECT * FROM plan_votes WHERE user_name='${username}'`);
    
            for (let vote of votesData) votes += vote.votes;
        } else votes = votesCache;


        this.caches.bentobox.set(uuid, bentoBoxData);
        this.caches.votes.set(uuid, votes);
        this.caches.uuids.push(uuid);
        return {
            bentoBoxData,
            votes
        };
    }

    createConnections() {
        for (const db of this.database) {
            let uri = db.uri;
            let user = db.user;
            let password = db.password;

            this[db.connectionName] = mysql.createConnection({
                host: uri.split(':')[0],
                port: uri.split(':')[1],
                user: user,
                password: password
            });

            this[db.connectionName].connect((e) => { if(e) throw e; Logger.info(`${db.connectionName} MySQL Connected!`) });

            this[db.connectionName]['promisifyQuery'] = require('util').promisify(this[db.connectionName].query);
        }
    }
}

module.exports = MySQL;
