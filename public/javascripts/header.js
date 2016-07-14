import {ajaxGet, el} from './utils';

let mobileMenuTemplate;
let room = sessionStorage.getItem('ss_room');

export function init() {
    initializeSidenav();
    
}

function appendMenuToDom() {
    ajaxGet("/templates/mobileMenu.html", function (mobileMenuHtml) {
        mobileMenuTemplate = mobileMenuHtml;
        populateHeader();
    });
}

function populateHeader() {
    el("#slide-out").append(mobileMenuTemplate);
}

function initializeSidenav() {
    $(".button-collapse").sideNav({
        menuWidth: 240, // Default is 240
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
}