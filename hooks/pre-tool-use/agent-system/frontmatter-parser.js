/**
 * Removes quotes from a string value
 * @param {*} value - Value to unquote
 * @returns {*} Unquoted value
 */
function unquote(value) {
  if (typeof value !== 'string') {
    return value;
  }
  
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
    return trimmed.slice(1, -1);
  }
  
  return trimmed;
}

/**
 * Normalizes a list by removing duplicates and empty values
 * @param {Array} list - List to normalize
 * @returns {Array} Normalized list
 */
function normalizeList(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  
  const seen = new Set();
  const result = [];
  
  for (const raw of list) {
    if (typeof raw !== 'string') {
      continue;
    }
    
    const value = raw.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    
    seen.add(value);
    result.push(value);
  }
  
  return result;
}

/**
 * Converts a value to a normalized list
 * @param {*} value - Value to convert
 * @returns {Array|null} List or null
 */
function toList(value) {
  if (value === undefined || value === null) {
    return null;
  }
  
  if (Array.isArray(value)) {
    return normalizeList(value);
  }
  
  if (typeof value === 'string') {
    if (!value.trim()) {
      return [];
    }
    const parts = value.split(',').map(part => part.trim()).filter(Boolean);
    return normalizeList(parts);
  }
  
  return null;
}

/**
 * Parses a YAML-like frontmatter block
 * @param {string} block - Frontmatter block content
 * @returns {Object} Parsed frontmatter data
 */
function parseFrontmatterBlock(block) {
  const lines = block.split('\n');
  const data = {};
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    
    if (!rawLine || !rawLine.trim()) {
      i++;
      continue;
    }

    const match = rawLine.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      i++;
      continue;
    }

    const [, key, rawValue = ''] = match;
    let value = rawValue.trim();

    // Check for list on following lines
    if (!value && i + 1 < lines.length) {
      const listItems = [];
      let j = i + 1;
      let foundList = false;

      while (j < lines.length) {
        const listLine = lines[j];
        
        if (!listLine.trim()) {
          j++;
          continue;
        }
        
        const trimmed = listLine.trim();
        if (trimmed.startsWith('- ')) {
          foundList = true;
          listItems.push(unquote(trimmed.slice(2)));
          j++;
          continue;
        }
        
        if (listLine.startsWith('  ') || listLine.startsWith('\t')) {
          j++;
          continue;
        }
        
        break;
      }

      if (foundList) {
        data[key] = listItems;
        i = j;
        continue;
      }
    }

    // Parse inline array notation [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      if (!inner) {
        data[key] = [];
      } else {
        data[key] = inner
          .split(',')
          .map(part => unquote(part.trim()))
          .filter(Boolean);
      }
    } else {
      data[key] = unquote(value);
    }

    i++;
  }

  return data;
}

module.exports = {
  parseFrontmatterBlock,
  toList,
  unquote,
  normalizeList
};

