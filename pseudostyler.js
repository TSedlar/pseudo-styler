class PseudoStyler {
  constructor() {
    this.styles = [];
    this.registered = new WeakMap();
    this.uniqueID = 0;
  }

  async loadDocumentStyles() {
    let count = document.styleSheets.length;
    for (let i = 0; i < count; i++) {
      let sheet = document.styleSheets[i];
      if (sheet.href) {
        await this.addLink(sheet.href);
      } else {
        if (sheet.ownerNode && sheet.ownerNode.nodeName &&
          sheet.ownerNode.nodeName === "STYLE" && sheet.ownerNode.firstChild) {
          this.addCSS(sheet.ownerNode.firstChild.textContent);
        }
      }
    }
  }

  addCSS(text) {
    let copySheet = document.createElement('style');
    copySheet.type = 'text/css';
    copySheet.textContent = text;
    document.head.appendChild(copySheet);
    for (let i = 0; i < copySheet.sheet.cssRules.length; i++) {
      if (copySheet.sheet.cssRules[i].selectorText && copySheet.sheet.cssRules[i].selectorText.includes(':')) {
        this.styles.push(copySheet.sheet.cssRules[i]);
      }
    }
    document.head.removeChild(copySheet);
  }

  async addLink(url) {
    const self = this;
    await new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.text())
        .then(res => {
          self.addCSS(res);
          resolve(self.styles);
        })
        .catch(err => reject(err));
    });
  }

  matches(element, selector, pseudoClass) {
    selector = selector.replace(new RegExp(pseudoClass, 'g'), '');
    for (let part of selector.split(/ +/)) {
      try {
        if (element.matches(part)) {
          return true;
        }
      } catch (ignored) {
        // reached a non-selector part such as '>'
      }
    }
    return false;
  }

  register(element, pseudoclass) {
    let uuid = this.uniqueID++;
    let customClasses = {};
    for (let style of this.styles) {
      if (style.selectorText.includes(pseudoclass)) {
        style.selectorText.split(/\s*,\s*/g)
          .filter(selector => this.matches(element, selector, pseudoclass))
          .forEach(selector => {
            let newSelector = this._getCustomSelector(selector, pseudoclass, uuid);
            customClasses[newSelector] = style.style.cssText.split(/\s*;\s*/).join(';');
          });
      }
    }

    if (!this.style) {
      this._createStyleElement();
    }
    for (let selector in customClasses) {
      let cssClass = selector + ' { ' + customClasses[selector] + ' }';
      this.style.sheet.insertRule(cssClass);
    }
    this.registered.get(element).set(pseudoclass, uuid);
  }

  deregister(element, pseudoClass) {
    if (this.registered.has(element) && this.registered.get(element).has(pseudoClass)) {
      let uuid = this.registered.get(element).get(pseudoClass);
      let className = this._getMimicClassName(pseudoClass, uuid);
      let regex = new RegExp(className + '($|\\W)');
      for (let i = 0; i < this.style.sheet.cssRules.length; i++) {
        if (regex.test(this.style.sheet.cssRules[i].selectorText)) {
          this.style.sheet.deleteRule(i);
        }
      }
      this.registered.get(element).delete(pseudoClass);
      element.classList.remove(className.substr(1));
    }
  }

  toggleStyle(element, pseudoclass, force) {
    if (!this.registered.has(element)) {
      this.registered.set(element, new Map());
    }
    if (!this.registered.get(element).has(pseudoclass)) {
      this.register(element, pseudoclass);
    }
    let uuid = this.registered.get(element).get(pseudoclass);
    element.classList.toggle(this._getMimicClassName(pseudoclass, uuid).substr(1), force);
  }

  _getMimicClassName(pseudoClass, uuid) {
    return pseudoClass.replace(':', '.') + '-pseudostyler-' + uuid;
  }

  _getCustomSelector(selectorText, pseudoClass, uuid) {
    return selectorText.replace(new RegExp(pseudoClass, 'g'), this._getMimicClassName(pseudoClass, uuid));
  }

  _createStyleElement() {
    let style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    this.style = style;
  }
}