console.log('selectionValuePath loaded');

var url = new URL(location.href);
var params = new URLSearchParams(url.search);

window.onload = function() {
    for(const object of document.getElementsByClassName('botSelection')) {
        object.setAttribute('onchange', 'window.location.pathname = this.value');
    }
}
