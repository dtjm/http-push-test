HTTP Push Tests
===============

Usage
-----

    git clone https://dtjm@github.com/dtjm/http-push-test.git
    cd http-push-test
    npm install
    node server.js
    open http://localhost:8000/

Tests different HTTP push techniques:

* Server-sent Events (aka EventSource), including JS polyfill
* XHR/Multipart (Firefox only)
* ActiveX htmlfile (IE7+)
* Socket.io
