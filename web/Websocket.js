const Routes = require('./routes/Routes');

const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');



class WebSocket {
    constructor(token, port, bot_list) {
        this.token = token;
        this.port = port;
        this.bot_list = bot_list;
        this.app = express();

        this.app.engine('hbs', hbs({
            extname: 'hbs',
            defaultLayout: 'layout',
            layoutsDir: __dirname + '/views/layouts',
            partialsDir: __dirname + '/views/partials'      //{{> partialsNames }}
        }));
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'hbs');

        this.app.use(express.static(path.join(__dirname, 'public')));

        this.app.use(require('hide-powered-by')({ setTo: 'PHP 4.2.0' }));
        this.app.use(require('dont-sniff-mimetype')());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        //this.registerRoots();
        this.routes = new Routes(this.app, this.token, this.bot_list)
        this.routes.register();

        this.server = this.app.listen(this.port, () => {
            console.log("Websocket API set up at port " + this.server.address().port)
        });
    }

    checkToken(_token) {
        return (_token == this.token);
    }

    registerRoots() {
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

module.exports = WebSocket;
