const fs = require("fs");
const yaml = require("js-yaml");

function parseYAML(fileContent) {
  try {
    const parsed = yaml.load(fileContent);

    console.log("YAML Parsed:");
    console.log(`Kind: ${parsed.kind}`);
    console.log(`Name: ${parsed.metadata?.name}`);
    console.log(`Image: ${parsed.spec?.template?.spec?.containers[0]?.image}`);

    return parsed;
  } catch (err) {
    console.error("Error parsing YAML file:", err.message);
    process.exit(1);
  }
}

module.exports = { parseYAML };