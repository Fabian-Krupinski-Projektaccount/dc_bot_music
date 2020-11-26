const url = new URL(location.href);
const params = new URLSearchParams(url.search);

window.onload = function() {
    for(const object of document.getElementsByClassName('valueToPath')) {
        object.setAttribute('onchange', 'window.location.pathname = this.value');
    }
}
