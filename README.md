# pseudo:styler

![](https://img.shields.io/github/license/mashape/apistatus.svg)
[![](https://img.shields.io/badge/donate-patreon-orange.svg)](https://www.patreon.com/bePatron?c=954360)
[![](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/TSedlar)

Allows for forcing an element to be styled with a pseudo-class

### Retrieving

JSDelivr kindly hosts this script [here](https://cdn.jsdelivr.net/gh/TSedlar/pseudo-styler@1.0.0/pseudostyler.js)

### Example usage: 

[JSFiddle](https://jsfiddle.net/sedarity/08rwosb5/)

```javascript
(async () => {
  let styler = new PseudoStyler();
  await styler.loadDocumentStyles();

  const button = document.querySelector("#button");
  const element = document.querySelector('#test');
  
  button.onclick = () => {
    styler.toggleStyle(element, ':hover');
  }
})();
```

### Explanation:
This script will grab all of the stylesheets in the current document, obtain their href links, and pass the CSS sources into a css parser. 

The default one should work fine, but can be overridden.

#### Thanks:

A large thanks goes to [Jason Miller](https://jsfiddle.net/developit/vzkckrw4/?fbclid=IwAR1xYJzsEcpglQ5KsqQG4DHJMAgpyMJaXV9dKkd_t47n465n2dzv23cduqw), as the CSS parser in his JSFiddle is the default parser used by this project.
