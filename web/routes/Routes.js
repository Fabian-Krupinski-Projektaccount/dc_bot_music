class Routes {
    constructor(app, token, client) {
        this.token = token;
        this.client = client;
        this.app = app;
    }

    checkToken(_token) {
        return (_token == this.token);
    }

    register() {
        this.app.get('/', (req, res) => {
            var _token = req.query.token;

            if (!this.checkToken(_token)) {
                res.render('error', { title: "ERROR" });
                return;
            }


            var text_channels = [];
            var voice_channels = [];
            this.client.guilds.cache.first().channels.cache
                .forEach(c => {
                    if(c.type == 'text') {
                        text_channels.push({id: c.id, name: c.name});
                    } else if(c.type == 'voice') {
                        voice_channels.push({id: c.id, name: c.name});
                    }
                });

            res.render('index', {
                title: "Web Interface",
                token: _token,
                text_channels,
                voice_channels
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
