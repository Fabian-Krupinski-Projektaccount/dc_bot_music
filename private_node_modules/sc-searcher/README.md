# Sc-Searcher

#Description:
Gets tracks that match a search term.

#Download:
NPM URL:
Console Command: npm install sc-searcher

#Usage:
Example:
```node
var scSearch = require('sc-searcher');
scSearch.getTracks("Avicii", 10, function callback(tracks){
  for(var i = 0; i < tracks.length; i++){
      console.log(tracks[i]);
  }
});
```
