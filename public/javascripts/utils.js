export function assert (condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function el(selector) {
    return childEl(document, selector);
}

export function childEl(parentElement, selector) {
    const elements = parentElement.querySelectorAll(selector);
    if (elements.length === 0) {
        return null;
    }
    
    return elements;
}

export function toggleClass(element, className) {
    let classList = element.classList;

    if (classList.contains(className)) {
        classList.remove(className);
    } else {
        classList.add(className);
    }
}

export function isString (input) {
    return typeof input === 'string' || input instanceof String;
}

export function ajaxGet(url, successFunc, errorFunc) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            successFunc();
        } else {
            errorFunc();
        }
    };

    request.onerror = errorFunc;

    request.send();
}