"use strict";
(function() {

    const navBarInput = {
        id: 'navBar',
        links: [
            {
                text: 'Home',
                href: 'index.html'
            },
            {
                text: 'Make a Booking',
                href: 'booking.html'
            }
        ]
    };
    
    // shorthand
    function $(id){
        return document.getElementById(id);
    }
    
    function NavBar(o) {
        // Construct the navBar.
        this.init = function() {
            this.options = o;
            this.elem = $(this.options.id);
            let html = "";
            this.options.links.forEach(function(link) {
                html += `<a href='${link.href}'>${link.text}</a>`;
            });
            this.elem.innerHTML = html;
        }
        this.init();
    }

    window.addEventListener('load', function() {
        let navBar = new NavBar(navBarInput);
    });

})();
