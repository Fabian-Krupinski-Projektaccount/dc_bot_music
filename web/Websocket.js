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

        this.routes = new Routes(this.app, this.token, this.bot_list)
        this.routes.register();

        this.server = this.app.listen(this.port, () => {
            console.log("Websocket API set up at port " + this.server.address().port)
        });
    }
}

module.exports = WebSocket;
