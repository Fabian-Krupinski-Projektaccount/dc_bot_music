class Database {
    init(dev) {
        this.db = require('quick.db');
        if (dev) db.delete('guilds');

        if (!db.get('guilds')) db.set('guilds', {});
    }

    get(location) {
        this.db.get(location);
    }

    set(location, value) {
        this.db.set(location, value);
    }

    /*createGuild(guild_id) {
        if (db.get(`guilds.${guild_id}`)) return db.get(`guilds.${guild_id}`);

        return db.set(`guilds.${guild_id}`, {
            guild_id: guild_id,
            command_queue: {},
        });
    }

    createCommand(command, client_id) {
        if (!db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}]`)) {
            db.set(`guilds.${command.guild_id}.command_queue[${command.message_id}]`, command);
        }

        if (db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}].executed`) == false) {
            this.addClientIdToCommand(command, client_id);
        }

        console.log(db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}]`));
    }

    addClientIdToCommand(command, client_id) {
        if (!db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}].client_id_list[${client_id}]`)) {
            db.push(`guilds.${command.guild_id}.command_queue[${command.message_id}].client_id_list`, client_id);
        }
    }

    getCommand(command) {
        return db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}]`);
    }

    setExecutedOfCommand(command, val) {
        return db.set(`guilds.${command.guild_id}.command_queue[${command.message_id}].executed`, val);
    }

    getExecutedOfCommand(command) {
        return db.get(`guilds.${command.guild_id}.command_queue[${command.message_id}].executed`);
    }*/
}


module.exports = Database;
