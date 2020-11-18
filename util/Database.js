const db = require('quick.db');

class Database {
    //Commands
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

    //ClientIds Bots
    pushClientId(guild_id, command_index, client_id) {
        db.push(`guilds.${guild_id}.command_queue[${command_index}].client_ids`, client_id);
    }

    isClientIdInList(guild_id, command_index, client_id) {
        if (db.get(`guilds.${guild_id}.command_queue[${command_index}].client_ids`).indexOf(client_id) == -1) {
            return false;
        }

        return true;
    }
}


module.exports = Database;
