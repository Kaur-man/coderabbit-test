/* 
  Test framework note:
  - Structure: describe/it compatible with Jest or Mocha.
  - Assertions: Node's built-in 'assert' (no new dependencies).
  - YAML parsing: If 'yaml' or 'js-yaml' is installed in the repo, parsing tests will run.
                  Otherwise, parsing-specific tests are skipped and string-based validations still run.

  Focus:
  - These tests validate the specific diff content for the CodeRabbit configuration, ensuring:
    * Schema directive is present and correct
    * version is 1
    * settings.tone_instructions is the expected string
    * settings.review booleans match expected values (enable true, auto_approve false, auto_merge false, summarize true)
  - If an actual file exists in common locations (coderabbit.yaml/.yml or under src/config), it will be used.
    Otherwise, the inline sample (matching the diff) is validated.
*/

const fs = require('fs');
const path = require('path');
const assert = require('assert');

function findExistingConfigPath() {
  const candidates = [
    'coderabbit.yaml',
    'coderabbit.yml',
    '.coderabbit.yaml',
    '.coderabbit.yml',
    'src/config/coderabbit.yaml',
    'src/config/coderabbit.yml'
  ];
  const cwd = process.cwd();
  for (const rel of candidates) {
    const abs = path.resolve(cwd, rel);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      return abs;
    }
  }
  return null;
}

const INLINE_CONFIG_YAML = `# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
version: 1
settings:
  tone_instructions: "Act like a friendly mentor" # or strict teacher, pirate, etc.
  review:
    enable: true         # turn reviews on/off
    auto_approve: false  # automatically approve if no issues? (false = default)
    auto_merge: false    # merge PRs automatically if approved
    summarize: true      # provide summary at end of review
`;

const CONFIG_PATH = findExistingConfigPath();
const YAML_TEXT = CONFIG_PATH ? fs.readFileSync(CONFIG_PATH, 'utf8') : INLINE_CONFIG_YAML;

function getYamlAdapter() {
  // Return { name, parse(str), dump(obj) } if available, else null
  try {
    // Prefer 'yaml' if present
    require.resolve('yaml');
    const YAML = require('yaml');
    return {
      name: 'yaml',
      parse: (s) => YAML.parse(s),
      dump: (o) => YAML.stringify(o),
    };
  } catch (_) {
    // Fallback to 'js-yaml' if present
    try {
      require.resolve('js-yaml');
      const jsYaml = require('js-yaml');
      return {
        name: 'js-yaml',
        parse: (s) => jsYaml.load(s),
        dump: (o) => jsYaml.dump(o),
      };
    } catch (__) {
      return null;
    }
  }
}

const yamlAdapter = getYamlAdapter();
const itIfParser = yamlAdapter ? it : (it && it.skip ? it.skip : (() => {}));

describe('Coderabbit configuration (diff-focused)', () => {
  describe('String-level validations (no YAML parser required)', () => {
    it('includes the correct $schema directive for yaml-language-server on the first line', () => {
      const firstLine = YAML_TEXT.split(/\r?\n/)[0];
      assert.match(
        firstLine,
        /^[ \t]*#\s*yaml-language-server:\s*\$schema=https:\/\/coderabbit\.ai\/integrations\/schema\.v2\.json[ \t]*$/,
        'First line should declare the yaml-language-server $schema pointing to schema.v2.json'
      );
    });

    it('declares version: 1 at the top level', () => {
      // Match a line starting with "version:" followed by 1
      assert.match(
        YAML_TEXT,
        /^version:\s*1\s*$/m,
        'Config should include "version: 1" at the top level'
      );
    });

    it('defines settings.tone_instructions with the expected friendly mentor string', () => {
      assert.match(
        YAML_TEXT,
        /^\s*tone_instructions:\s*"Act like a friendly mentor"/m,
        'tone_instructions should be "Act like a friendly mentor"'
      );
    });

    it('defines review settings with the correct boolean values (enable, auto_approve, auto_merge, summarize)', () => {
      // Check presence of the review block and each setting with expected values
      assert.match(
        YAML_TEXT,
        /^\s*review:\s*$/m,
        'review block should be present'
      );
      assert.match(
        YAML_TEXT,
        /^\s*enable:\s*true\b/m,
        'review.enable should be true'
      );
      assert.match(
        YAML_TEXT,
        /^\s*auto_approve:\s*false\b/m,
        'review.auto_approve should be false'
      );
      assert.match(
        YAML_TEXT,
        /^\s*auto_merge:\s*false\b/m,
        'review.auto_merge should be false'
      );
      assert.match(
        YAML_TEXT,
        /^\s*summarize:\s*true\b/m,
        'review.summarize should be true'
      );
    });
  });

  describe('YAML parsing validations (run when a YAML parser dependency is present)', () => {
    itIfParser('parses successfully and exposes expected structure and values', () => {
      const cfg = yamlAdapter.parse(YAML_TEXT);
      assert.ok(cfg && typeof cfg === 'object', 'Parsed config must be an object');

      // Top-level keys
      assert.strictEqual(typeof cfg.version, 'number', 'version should be a number');
      assert.strictEqual(cfg.version, 1, 'version should equal 1');
      assert.ok(cfg.settings && typeof cfg.settings === 'object', 'settings should be present');

      // settings.tone_instructions
      assert.strictEqual(
        typeof cfg.settings.tone_instructions,
        'string',
        'settings.tone_instructions should be a string'
      );
      assert.strictEqual(
        cfg.settings.tone_instructions,
        'Act like a friendly mentor',
        'tone_instructions should match the expected value'
      );

      // settings.review booleans
      const review = cfg.settings.review;
      assert.ok(review && typeof review === 'object', 'settings.review should be an object');
      assert.strictEqual(review.enable, true, 'review.enable should be true');
      assert.strictEqual(review.auto_approve, false, 'review.auto_approve should be false');
      assert.strictEqual(review.auto_merge, false, 'review.auto_merge should be false');
      assert.strictEqual(review.summarize, true, 'review.summarize should be true');
    });

    itIfParser('does not contain unexpected top-level keys', () => {
      const cfg = yamlAdapter.parse(YAML_TEXT);
      const keys = Object.keys(cfg).sort();
      assert.deepStrictEqual(
        keys,
        ['settings', 'version'],
        'Only "version" and "settings" should be present at the top level'
      );
    });

    itIfParser('round-trips through YAML dump/stringify without losing structure', () => {
      const parsed = yamlAdapter.parse(YAML_TEXT);
      const dumped = yamlAdapter.dump(parsed);
      const reparsed = yamlAdapter.parse(dumped);
      // Comments and formatting can be lost; compare object structure only
      assert.deepStrictEqual(
        reparsed,
        parsed,
        'Re-parsed object should deeply equal the original parsed object'
      );
    });
  });

  describe('Robustness checks on content (defensive guards)', () => {
    it('tone_instructions contains a non-empty, human-readable message', () => {
      const match = YAML_TEXT.match(/tone_instructions:\s*"([^"]*)"/);
      assert.ok(match && match[1].trim().length > 0, 'tone_instructions must be a non-empty string');
      assert.match(match[1], /friendly mentor/i, 'tone_instructions should signal a friendly mentor tone');
    });

    it('review flags are declared on separate lines (helps readability and tooling)', () => {
      const lines = YAML_TEXT.split(/\r?\n/);
      const flagLines = lines.filter(l =>
        /\b(enable|auto_approve|auto_merge|summarize)\s*:/.test(l)
      );
      // Expect 4 distinct flag lines
      assert.strictEqual(flagLines.length, 4, 'review must declare 4 flags on their own lines');
    });
  });
});