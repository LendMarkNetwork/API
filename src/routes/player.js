const { playerNameToUUID } = require("../utils/Util");
const Base = require("./Base");

class Player extends Base {
    constructor() {
        super({
            name: 'player'
        })
    }

    async run({ format, query, mysql }) {
        if(!query.name) return format({
            error: 'Missing query: name',
            status: 400,
            statusText: 'Bad Request'
        }, 400)

        let uuid = playerNameToUUID(query.name);

        let player = await mysql.getPlayer(query.name, uuid);
        let data = { minigames: {} };

        data["global"] = {
            name: query.name,
            uuid,
            votes: player.votes
        }

        data["minigames"]["oneblock"] = {
            homes: player.bentoBoxData.homeLocations,
            resets: player.bentoBoxData.resets,
            locale: player.bentoBoxData.locale,
            deaths: player.bentoBoxData.deaths,
            kicks: player.bentoBoxData.pendingKicks,
            flagsDisplayMode: player.bentoBoxData.flagsDisplayMode,
            meta: player.bentoBoxData.metaData,
        }

        format(data, 200)
    }
}

module.exports = Player;
