class Database {
    constructor() {
        this.db = require('quick.db');
    }

    getCommandQueue(guild_id) {
        if (this.db.get(`guilds.${guild_id}.command_queue`)) {
            return this.db.get(`guilds.${guild_id}.command_queue`);
        } else {
            return -1;
        }
    }
}


module.exports = Database;
