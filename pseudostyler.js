class PseudoStyler {
  constructor(parseCSS = null) {
    this.styles = [];
    this.registered = new WeakMap();
    if (!parseCSS) {
    	parseCSS = DefaultParser.parseCSS;
    }
    this.parseCSS = parseCSS;
  }

  async loadDocumentStyles() {
    for (let sheet of document.styleSheets) {
      if (sheet.href) {
        await this.addLink(sheet.href);
      } else {
        try {
          if (sheet.ownerNode && sheet.ownerNode.nodeName &&
              sheet.ownerNode.nodeName === "STYLE" && sheet.ownerNode.firstChild) {
            this.addCSS(sheet.ownerNode.firstChild.textContent);
          }
        } catch (_) {
          console.log('failed to load style sheet (CORS):');
          console.log(sheet);
        }
      }
    }
  }

  addCSS(css) {
  	this.styles.push(...this.parseCSS(css));
  }

  async addLink(url) {
  	const self = this;
  	await new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.text())
        .then(res => {
        	self.addCSS(res);
          resolve(self.styles)
        })
        .catch(err => reject(err));
    });
  }

  _checkSelector(element, selector) {
  	try {
    	return element.matches(selector);
    } catch (_) {
    	return false;
    }
  }

  register(element, pseudoclass) {
    let customClasses = {};
    for (let style of this.styles) {
      if (style.selectorText.includes(pseudoclass)) {
        if (this._checkSelector(element, style.selectorText.replace(new RegExp(pseudoclass, 'g'), ''))) {
          let newSelector = this._getCustomSelector(style.selectorText, pseudoclass);
          customClasses[newSelector] = [];
          Object.keys(style.style).filter(key => key !== 'cssText').forEach(key => {
            customClasses[newSelector].push(key + ':' + style.style[key] + ' !important;');
          });
        }
      }
    }

    if (!this.style) {
      this._createStyleElement();
    }
    for (let selector in customClasses) {
      let _class = selector + ' { ' + customClasses[selector].join('') + ' }';
      this.style.append(document.createTextNode(_class));
    }
    this.registered.get(element).set(pseudoclass, true);
  }

  toggleStyle(element, pseudoclass) {
    if (!this.registered.has(element)) {
      this.registered.set(element, new Map());
    }
    if (!this.registered.get(element).get(pseudoclass)) {
      this.register(element, pseudoclass);
    }
    element.classList.toggle(this._getMimicClassName(pseudoclass).substr(1));
  }

  _getMimicClassName(pseudoClass) {
    return pseudoClass.replace(':', '.') + '-pseudostyler';
  }

  _getCustomSelector(selectorText, pseudoClass) {
    return selectorText.replace(pseudoClass, this._getMimicClassName(pseudoClass));
  }

  _createStyleElement() {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    document.head.appendChild(style);
    this.style = style;
  }
}

const DefaultParser = {
	parseRule: (css) => {
    let tokenizer = /\s*([a-z\-]+)\s*:\s*((?:[^;]*url\(.*?\)[^;]*|[^;]*)*)\s*(?:;|$)/gi;
    let obj = {};
    let token;
    while ((token = tokenizer.exec(css))) {
      obj[token[1].toLowerCase()] = token[2];
    }
    return obj;
  },

  stringifyRule: (style) => {
    let text = '';
    let keys = Object.keys(style).sort();
    for (let i = 0; i < keys.length; i++) {
    	text += ` ${keys[i]}: ${style[keys[i]]};`
    }
    return text.substring(1);
  },

  parseCSS: (text) => {
    let tokenizer = /([\s\S]+?)\{([\s\S]*?)\}/gi;
    let rules = [];
    let rule;
    let token;
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    while ((token = tokenizer.exec(text))) {
      let style = DefaultParser.parseRule(token[2].trim());
      style.cssText = DefaultParser.stringifyRule(style);
      rule = {
        selectorText: token[1].trim().replace(/\s*\,\s*/, ', '),
        style: style
      };
      rule.cssText = rule.selectorText + ' { ' + rule.style.cssText + ' }';
      rules.push(rule);
    }
    return rules;
  }
}
