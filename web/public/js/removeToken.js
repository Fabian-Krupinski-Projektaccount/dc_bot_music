function removeToken() {
    var urlParams = new URLSearchParams(window.location.search);
    var _token = urlParams.get('token') || null;
    urlParams.delete('token');
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}${window.location.hash}`);

    return _token;
}
