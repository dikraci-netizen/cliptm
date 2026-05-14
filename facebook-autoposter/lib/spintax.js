// Facebook Auto Poster Pro - Spintax Engine
const Spintax = {
  /**
   * Process spintax content: {option1|option2|option3}
   * Returns a random variation each time
   */
  process(text) {
    const pattern = /\{([^{}]+)\}/g;
    let result = text;
    let match;
    
    // Handle nested spintax by processing from inside out
    let maxIterations = 10;
    while (result.includes('{') && maxIterations > 0) {
      result = result.replace(pattern, (match, group) => {
        const options = group.split('|');
        return options[Math.floor(Math.random() * options.length)];
      });
      maxIterations--;
    }
    
    return result;
  },

  /**
   * Generate multiple unique variations from spintax
   */
  generateVariations(text, count = 5) {
    const variations = new Set();
    const maxAttempts = count * 10;
    let attempts = 0;
    
    while (variations.size < count && attempts < maxAttempts) {
      variations.add(this.process(text));
      attempts++;
    }
    
    return [...variations];
  },

  /**
   * Count possible combinations
   */
  countCombinations(text) {
    const pattern = /\{([^{}]+)\}/g;
    let total = 1;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const options = match[1].split('|');
      total *= options.length;
    }
    
    return total;
  },

  /**
   * Validate spintax syntax
   */
  validate(text) {
    let depth = 0;
    for (const char of text) {
      if (char === '{') depth++;
      if (char === '}') depth--;
      if (depth < 0) return { valid: false, error: 'Accolade fermante sans ouvrante' };
    }
    if (depth !== 0) return { valid: false, error: 'Accolades non equilibrees' };
    
    // Check for empty options
    const pattern = /\{([^{}]*)\}/g;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const options = match[1].split('|');
      if (options.some(o => o.trim() === '')) {
        return { valid: false, error: 'Option vide detectee' };
      }
      if (options.length < 2) {
        return { valid: false, error: 'Au moins 2 options requises dans chaque bloc' };
      }
    }
    
    return { valid: true };
  }
};
