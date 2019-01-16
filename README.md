# pseudo:styler

[![](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)
[![](https://img.shields.io/badge/donate-patreon-orange.svg)](https://www.patreon.com/bePatron?c=954360)
[![](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/TSedlar)

[![](https://data.jsdelivr.com/v1/package/gh/TSedlar/pseudo-styler/badge)](https://www.jsdelivr.com/package/gh/TSedlar/pseudo-styler)

Allows for forcing an element to be styled with a pseudo-class

### Retrieving

JSDelivr kindly hosts this script [here](https://www.jsdelivr.com/package/gh/TSedlar/pseudo-styler)

```html
<script type='text/javascript' src='https://cdn.jsdelivr.net/gh/TSedlar/pseudo-styler@1.0.4/pseudostyler.js'>
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
  })
})();
```

### Explanation:
This script will grab all of the stylesheets in the current document, obtain their href links, and pass the CSS sources into a css parser.

The default one should work fine, but can be overridden.

#### Thanks:

Thanks goes to [Finn Thompson](https://github.com/FThompson) for the idea of the project and helping to polish the code and fix bugs for cross-browser compatibility.
