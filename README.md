# pseudo:styler

[![](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)
[![](https://img.shields.io/badge/donate-patreon-orange.svg)](https://www.patreon.com/bePatron?c=954360)
[![](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/TSedlar)

[![](https://data.jsdelivr.com/v1/package/gh/TSedlar/pseudo-styler/badge)](https://www.jsdelivr.com/package/gh/TSedlar/pseudo-styler)

Allows for forcing an element to be styled with a pseudo-class.

### Retrieving

JSDelivr kindly hosts this script [here](https://www.jsdelivr.com/package/gh/TSedlar/pseudo-styler)

```html
<script type='text/javascript' src='https://cdn.jsdelivr.net/gh/TSedlar/pseudo-styler@1.0.7/pseudostyler.js'>
```

### Example usage:

[codepen](https://codepen.io/tsedlar/pen/EGrBqm)

```javascript
(async () => {
  let styler = new PseudoStyler();
  await styler.loadDocumentStyles();
  document.getElementById('button').addEventListener('click', () => {
    const element = document.querySelector('#test');
    styler.toggleStyle(element, ':hover');
  });
})();
```

### Explanation:
This script will grab all of the stylesheets in the current document, obtain their href links, and pass the CSS sources into a hidden stylesheet to be parsed.

### Methods:
```javascript
toggleStyle(element, pseudoClass[, force])
```

Toggles a pseudo class on an element. If the optional `force` parameter is specified, then if `true`, toggle the pseudo class on; if `false`, toggle the pseudo class off.

```javascript
async loadDocumentStyles()
```

Asynchronously loads all styles from the current document to be parsed for pseudo class rules.

```javascript
register(element, pseudoClass)
```

Finds any applicable CSS pseudo class rules for the element and adds them to a separate style sheet. This method is called automatically by `toggleStyle`.

```javascript
deregister(element, pseudoClass)
```

Removes the element's mimicked pseudo class from the styler's stylesheet. This method can be useful to clear the mimicked rules in case the element's style has changed.

```javascript
addCSS(text)
```

Adds CSS to this style sheet's rules that are checked for pseudo classes.

```javascript
async addLink(url)
```

Fetches the CSS resource and adds its CSS to the styler.

#### Thanks:

Thanks goes to [Finn Thompson](https://github.com/FThompson) for the idea of the project and helping to polish the code and fix bugs for cross-browser compatibility.
