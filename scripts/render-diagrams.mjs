// Pre-render each framework's example diagram (data/frameworks.json → diagram)
// to a static SVG string, so the site needs no diagram JS at runtime.
//
// Usage: node scripts/render-diagrams.mjs data/frameworks.json data/diagrams.json
import fs from "node:fs";
import { renderDiagram } from "./diagram-renderer.mjs";

const [input, output] = process.argv.slice(2);
const { frameworks } = JSON.parse(fs.readFileSync(input, "utf8"));

const diagrams = {};
for (const fw of frameworks) {
  if (!fw.diagram) throw new Error(`${fw.slug} has no diagram`);
  diagrams[fw.slug] = renderDiagram(fw.diagram.type, fw.diagram.spec);
}
fs.writeFileSync(output, JSON.stringify(diagrams) + "\n");
console.log(`${Object.keys(diagrams).length} diagrams -> ${output}`);
