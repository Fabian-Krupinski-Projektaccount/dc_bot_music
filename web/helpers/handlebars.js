module.exports = {
    allClients: function(client_list) {
        var client_string = '';
        for (const client of client_list) {
            client_string += '_'+client.user.id;
        }
        return client_string;
    }
}

//<!--<option value="{{#allClients}}">All</option>-->
