class PseudoStyler {
  constructor(parseCSS = null) {
    this.styles = [];
    if (!parseCSS) {
    	parseCSS = DefaultParser.parseCSS
    }
    this.parseCSS = parseCSS;
  }

  async addLink(url) {
  	const self = this;
  	await new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.text())
        .then(res => {
          self.styles.push(...self.parseCSS(res))
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

  forceStyle(element, pseudoclass) {
  	let matchedStyle = {};
    for (let style of this.styles) {
      if (style.selectorText.includes(pseudoclass)) {
        if (this._checkSelector(element, style.selectorText.replace(new RegExp(pseudoclass, 'g'), ''))) {
          matchedStyle = Object.assign(matchedStyle, style.style);
        }
      }
    }

    delete matchedStyle['cssText'];

    for (let key of Object.keys(matchedStyle)) {
      element.style[key] = matchedStyle[key];
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
