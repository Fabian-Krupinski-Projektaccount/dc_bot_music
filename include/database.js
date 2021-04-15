class Database {
    init(dev) {
        this.db = require('quick.db');
        if (dev) this.db.delete('guilds');

        if (!this.db.get('guilds')) this.db.set('guilds', {});
    }

    get(location) {
        this.db.get(location);
    }

    set(location, value) {
        this.db.set(location, value);
    }

    getCommand(command) {
        return this.db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}]`);
    }

    setExecutedOfCommand(command, val) {
        return this.db.set(`guilds.${command.guild_id}.command_queue[${command.message_id}].executed`, val);
    }

    getExecutedOfCommand(command) {
        return this.db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}].executed`);
    }
}


module.exports = Database;
