class Routes {
    constructor(app, token, bot_list) {
        this.token = token;
        this.bot_list = bot_list;
        this.app = app;
    }

    checkToken(_token) {
        return (_token == this.token);
    }

    checkClientId(id_list) {
        var id_list = id_list.split('_');
        id_list.shift();

        var valid_client_ids = [];
        for (const client of this.bot_list) {
            for (const id of id_list) {
                if (client.user.id == id) valid_client_ids.push(id);
            }
        }

        if (valid_client_ids.length > 0) {
            return valid_client_ids;
        } else {
            return -1;
        }
    }

    register() {
        this.app.get('/', (req, res) => {
            const _token = req.query.token || null;

            res.render('index', {
                title: 'Web Interface',
                token: _token,
                valid: this.checkToken(_token)
            });
        });

        this.app.get('/:id', (req, res) => {
            const _token = req.query.token;
            const client_id_list = this.checkClientId(req.params.id);
            console.log(client_id_list);

            if (!this.checkToken(_token)) {
                res.render('error', { title: 'ERROR'});
                return;
            }

            res.render('bot', {
                title: 'Web Interface',
                token: _token,
                bot_list: this.bot_list,
            });
        });

        this.app.post('/sendMessage', (req, res) => {
            var _token = req.body.token;
            var channelid = req.body.channelid;
            var text = req.body.text;

            if(!_token || !channelid || !text) {
                return res.sendStatus(400);
            }
            if (!this.checkToken(_token)) {
                return res.sendStatus(401);
            }


            var channel = this.client.guilds.cache.first().channels.cache.get(channelid);
            if(channel) {
                channel.send(text);
                res.sendStatus(200);
            } else {
                res.sendStatus(406);
            }
        });
    }
}

module.exports = Routes;
