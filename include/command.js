class Command{
    constructor(params) {
        this.guild_id = params.guild_id;
        this.channel_id = params.channel_id;
        this.message_id = params.message_id;
        this.args = params.args;
        this.command_name = params.command_name;
        this.client_id_list = [];
        this.executed = false;
    }
}


module.exports = Command;
