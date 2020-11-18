class Song {
    constructor(url, type) {
        this.type = type;
        this.url = url;
    }

    static type = {
        '0': 'yt',
        '1': 'sc',
    };
}

module.exports = Song;
