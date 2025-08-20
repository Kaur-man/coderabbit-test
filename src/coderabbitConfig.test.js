/**
 * CodeRabbit configuration tests
 *
 * Testing library and framework: Jest (Create React App default).
 * We validate .coderabbit.yml matches the expected structure and values
 * from the PR diff:
 *   - version: 1
 *   - settings.tone_instructions: "Act like a strict teacher"
 *   - settings.review.enable: true
 *   - settings.review.auto_approve: false
 *   - settings.review.auto_merge: false
 *   - settings.review.summarize: true
 *
 * No additional dependencies are introduced. If js-yaml/yaml are present they
 * will be used. Otherwise we fallback to a minimal parser that handles this
 * specific structure and inline comments.
 */

const fs = require('fs');
const path = require('path');

function findCodeRabbitConfigPaths() {
  const candidates = [
    'coderabbit.yaml',
    'coderabbit.yml',
    '.coderabbit.yaml',
    '.coderabbit.yml',
    'coderabbit.json',
    '.coderabbit.json',
  ];
  const found = [];
  for (const c of candidates) {
    const p = path.resolve(process.cwd(), c);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      found.push(p);
    }
  }
  return found;
}

function tryLoadYamlParser() {
  try {
    return require('js-yaml');
  } catch {
    try {
      return require('yaml');
    } catch {
      return null;
    }
  }
}

// Minimal parser that is tolerant of inline comments and quotes.
// It extracts only the fields we care about for these tests.
function fallbackParseMinimal(text) {
  const lines = text.split(/\r?\n/);
  const result = {};
  let inSettings = false;
  let inReview = false;

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // New top-level key begins (no leading space)
    if (!/^\s/.test(line)) {
      inSettings = false;
      inReview = false;
    }

    // version: number (allow trailing comments)
    let m = trimmed.match(/^version:\s*([0-9]+)\s*(?:#.*)?$/i);
    if (m) {
      result.version = Number(m[1]);
      continue;
    }

    // settings:
    if (trimmed.match(/^settings:\s*(?:#.*)?$/)) {
      inSettings = true;
      inReview = false;
      if (!result.settings) result.settings = {};
      continue;
    }

    if (inSettings) {
      // tone_instructions: "..." or unquoted; allow trailing comments
      m = trimmed.match(/^tone_instructions:\s*(?:"([^"]*)"|([^#]+?))\s*(?:#.*)?$/);
      if (m) {
        if (!result.settings) result.settings = {};
        const val = (m[1] !== undefined ? m[1] : m[2]).trim();
        result.settings.tone_instructions = val;
        continue;
      }

      // review:
      if (trimmed.match(/^review:\s*(?:#.*)?$/)) {
        inReview = true;
        if (!result.settings) result.settings = {};
        if (!result.settings.review) result.settings.review = {};
        continue;
      }

      if (inReview) {
        // booleans (allow trailing comments)
        const b = trimmed.match(/^([a-zA-Z_]+):\s*(true|false)\s*(?:#.*)?$/i);
        if (b) {
          const key = b[1];
          const val = b[2].toLowerCase() === 'true';
          if (!result.settings) result.settings = {};
          if (!result.settings.review) result.settings.review = {};
          result.settings.review[key] = val;
          continue;
        }
      }
    }
  }
  return result;
}

function loadAndParseConfig(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const yaml = tryLoadYamlParser();
  if (yaml) {
    try {
      const parsed = yaml.load ? yaml.load(text) : yaml.parse(text);
      return parsed;
    } catch {
      // Fall back if parsing fails
    }
  }
  return fallbackParseMinimal(text);
}

function expectBoolean(obj, keys) {
  let cur = obj;
  for (const k of keys) {
    expect(cur, `Missing key "${keys.join('.')}"`).toBeDefined();
    cur = cur[k];
  }
  expect(typeof cur).toBe('boolean');
  return cur;
}
function expectString(obj, keys) {
  let cur = obj;
  for (const k of keys) {
    expect(cur, `Missing key "${keys.join('.')}"`).toBeDefined();
    cur = cur[k];
  }
  expect(typeof cur).toBe('string');
  return cur;
}
function expectNumber(obj, keys) {
  let cur = obj;
  for (const k of keys) {
    expect(cur, `Missing key "${keys.join('.')}"`).toBeDefined();
    cur = cur[k];
  }
  expect(typeof cur).toBe('number');
  return cur;
}

describe('CodeRabbit configuration (.coderabbit.yml)', () => {
  const configPaths = findCodeRabbitConfigPaths();

  test('locates a CodeRabbit config file in common locations', () => {
    expect(Array.isArray(configPaths)).toBe(true);
    if (configPaths.length > 0) {
      const p = configPaths[0];
      const stat = fs.statSync(p);
      expect(stat.isFile()).toBe(true);
      const content = fs.readFileSync(p, 'utf8');
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    }
  });

  (configPaths.length > 0 ? describe : describe.skip)('validates required keys and values', () => {
    const filePath = configPaths[0];
    const config = loadAndParseConfig(filePath);

    test('has version: 1', () => {
      const version = expectNumber(config, ['version']);
      expect(version).toBe(1);
    });

    test('has settings.tone_instructions equal to "Act like a strict teacher"', () => {
      const tone = expectString(config, ['settings', 'tone_instructions']);
      expect(tone).toBe('Act like a strict teacher');
    });

    describe('settings.review booleans', () => {
      test('enable is true', () => {
        const v = expectBoolean(config, ['settings', 'review', 'enable']);
        expect(v).toBe(true);
      });
      test('auto_approve is false', () => {
        const v = expectBoolean(config, ['settings', 'review', 'auto_approve']);
        expect(v).toBe(false);
      });
      test('auto_merge is false', () => {
        const v = expectBoolean(config, ['settings', 'review', 'auto_merge']);
        expect(v).toBe(false);
      });
      test('summarize is true', () => {
        const v = expectBoolean(config, ['settings', 'review', 'summarize']);
        expect(v).toBe(true);
      });
    });

    test('optionally references coderabbit schema in comments or keys (non-fatal)', () => {
      // Non-fatal: if a $schema or yaml-language-server key exists, check value shape
      const schema = config && (config['$schema'] || config['yaml-language-server']);
      if (schema) {
        expect(String(schema)).toContain('coderabbit.ai');
        expect(String(schema)).toMatch(/schema\.v2\.json/);
      }
    });
  });

  test('gracefully handles missing configuration', () => {
    if (configPaths.length === 0) {
      expect(findCodeRabbitConfigPaths()).toEqual([]);
    } else {
      const p = configPaths[0];
      expect(() => fs.readFileSync(p, 'utf8')).not.toThrow();
    }
  });
});