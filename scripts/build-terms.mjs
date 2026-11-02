// Merges database/terms/*.json into database/terms.json, normalising the compact schema and validating.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const dir = 'database/terms';
const norm = t => ({ ...t, summary: t.summary ?? t.definition, scenario: t.scenario ?? t.field_scenario, integration: t.integration ?? '',
  industry: t.industry ?? ['Power', 'Water', 'Oil & Gas'], level: t.level ?? 'essential' });
const all = readdirSync(dir).filter(f => f.endsWith('.json')).sort().flatMap(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))).map(norm);
const seen = new Set();
for (const t of all) {
  for (const k of ['id', 'term', 'protocol']) if (!t[k]) throw new Error(`Term ${t.id ?? '?'} missing ${k}`);
  for (const k of ['summary', 'scenario', 'troubleshooting']) if (!t[k] || t[k].length < 20) throw new Error(`Term ${t.id} missing or short: ${k}`);
  if (seen.has(t.id)) throw new Error(`Duplicate id: ${t.id}`);
  seen.add(t.id);
}
writeFileSync('database/terms.json', JSON.stringify(all, null, 1));
console.log(`terms.json: ${all.length} terms`);
