const db = require('quick.db');

class Database {
    setup(dev) {
        if (!db.get('guilds')) {
            db.set('guilds', {});
        }
        if (dev) {
            db.delete('guilds');
        }
    }

    /*
    ----------------------GUILDS----------------------
    */
    guildExists(guild_id) {
        if (db.get(`guilds.${guild_id}`)) return true;
        return false;
    }

    createGuild(guild_id) {
        if (this.guildExists(guild_id)) return db.get(`guilds.${guild_id}`);

        return db.set(`guilds.${guild_id}`, {
            guild_id: guild_id,
            command_queue: [],
        });
    }


    /*
    ----------------------COMMANDS----------------------
    */
    getCommandQueue(guild_id) {
        if (db.get(`guilds.${guild_id}.command_queue`)) {
            return db.get(`guilds.${guild_id}.command_queue`);
        } else {
            return -1;
        }
    }

    getCommandIndex(guild_id, message_id) {
        let command_queue = this.getCommandQueue(guild_id);
        for(var i = 0; i < command_queue.length; i++) {
            if (command_queue[i]['message_id'] === message_id) return i;
        }
        return -1;
    }

    getCommandObject(guild_id, message_id) {
        let command_queue = this.getCommandQueue(guild_id);
        for(var i = 0; i < command_queue.length; i++) {
            if (command_queue[i]['message_id'] === message_id) return command_queue[i];
        }
        return -1;
    }

    pushCommand(guild_id, command_object) {
        db.push(`guilds.${guild_id}.command_queue`, command_object);
    }


    /*
    ----------------------CLIENT IDS----------------------
    */
    pushClientId(guild_id, command_index, client_id) {
        db.push(`guilds.${guild_id}.command_queue[${command_index}].client_ids`, client_id);
    }

    getClientIdList(guild_id, command_index) {
        if (!db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`)) return -1;

        return db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`);
    }

    isClientIdInList(guild_id, command_index, client_id) {
        if (db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`).indexOf(client_id) == -1) return false;

        return true;
    }
}


module.exports = Database;
