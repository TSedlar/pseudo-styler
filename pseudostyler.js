class PseudoStyler {
  constructor(parseCSS = null) {
    this.styles = [];
    this.defaultStyles = new WeakMap();
    this.pseudoMap = new WeakMap();
    if (!parseCSS) {
    	parseCSS = DefaultParser.parseCSS
    }
    this.parseCSS = parseCSS;
  }

  async loadDocumentStyles() {
    for (let sheet of document.styleSheets) {
      if (sheet.href) {
        await this.addLink(sheet.href);
      } else {
        try {
          if (sheet.ownerNode && sheet.ownerNode.nodeName && sheet.ownerNode.nodeName === "STYLE") {
            this.addCSS(sheet.ownerNode.firstChild.textContent)
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

  register(element) {
    if (!this.defaultStyles.has(element) && !this.pseudoMap.has(element)) {
      this.defaultStyles.set(element, getComputedStyle(element));
      this.pseudoMap.set(element, new Map());
    }
  }

  setDefaultStyle(element) {
    if (this.defaultStyles.has(element)) {
      element.style = this.defaultStyles.get(element);
      if (this.pseudoMap.has(element)) {
      	this.pseudoMap.delete(element);
        this.defaultStyles.delete(element);
      }
    }
  }

  deleteStyle(element, pseudoclass) {
    if (this.pseudoMap.has(element)) {
      const defaultStyle = this.defaultStyles.get(element);
      const pseudo = this.pseudoMap.get(element);
      if (pseudo.has(pseudoclass)) {
        const style = pseudo.get(pseudoclass);
        for (let key of Object.keys(style)) {
          if (defaultStyle && key in defaultStyle) {
            element.style[key] = defaultStyle[key];
          } else {
            delete element.style[key];
          }
        }
        pseudo.delete(pseudoclass);
      }
    }
  }

  toggleStyle(element, pseudoclass) {
    this.register(element);

    if (this.pseudoMap.get(element).has(pseudoclass)) {
      this.deleteStyle(element, pseudoclass);
    } else {
    	let matchedStyle = {};

      for (let style of this.styles) {
        if (style.selectorText.includes(pseudoclass)) {
          if (this._checkSelector(element, style.selectorText.replace(new RegExp(pseudoclass, 'g'), ''))) {
            matchedStyle = Object.assign(matchedStyle, style.style);
          }
        }
      }

      delete matchedStyle['cssText'];

      this.pseudoMap.get(element).set(pseudoclass, matchedStyle);

      for (let key of Object.keys(matchedStyle)) {
        element.style[key] = matchedStyle[key];
      }
    }
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
