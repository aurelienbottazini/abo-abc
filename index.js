#!/usr/bin/env node

const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");
const fs = require("fs");

function calculateAbcWithTreeSitter(code) {
  // 1. Initialize the Parser
  const parser = new Parser();
  parser.setLanguage(JavaScript);

  // 2. Parse the source code
  const tree = parser.parse(code);

  let assignments = 0;
  let branches = 0;
  let conditions = 0;

  const conditionalOperators = [
    "&&",
    "||",
    "??",
    "==",
    "===",
    "!=",
    "!==",
    "<",
    "<=",
    ">",
    ">=",
  ];

  // 3. Recursively traverse the syntax tree
  function traverse(node) {
    // Check the node's type and increment the corresponding counter
    switch (node.type) {
      case "assignment_expression":
      case "augmented_assignment_expression":
      case "update_expression":
        assignments++;
        break;
      case "variable_declarator":
        // Only count if it's an initialization
        if (node.childCount > 1) {
          assignments++;
        }
        break;
      case "call_expression":
      case "new_expression":
        branches++;
        break;
      case "if_statement":
      case "conditional_expression":
      case "for_statement":
      case "while_statement":
      case "do_statement":
      case "switch_case":
        conditions++;
        break;
      case "binary_expression":
        if (conditionalOperators.includes(node.children[1].text)) {
          conditions++;
        }
        break;
    }

    // 4. Continue traversal to children nodes
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(tree.rootNode);

  // 5. Calculate the final magnitude
  const magnitude = Math.sqrt(
    assignments ** 2 + branches ** 2 + conditions ** 2,
  );

  return {
    assignments,
    branches,
    conditions,
    magnitude: parseFloat(magnitude.toFixed(2)),
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    console.error("Usage: abc [filepath]");
    console.error("If no filepath is provided, reads from stdin");
    process.exit(1);
  }

  if (args.length === 1) {
    // Read from file
    const filepath = args[0];
    try {
      const code = fs.readFileSync(filepath, 'utf8');
      const abcMetrics = calculateAbcWithTreeSitter(code);
      console.log("ABC Metric:", abcMetrics);
    } catch (error) {
      console.error(`Error reading file ${filepath}:`, error.message);
      process.exit(1);
    }
  } else {
    // Read from stdin
    let input = '';

    // Check if stdin is a TTY (interactive terminal)
    if (process.stdin.isTTY) {
      console.error("No input provided. Usage: abc [filepath] or pipe content to stdin");
      process.exit(1);
    }

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      input += chunk;
    });

    process.stdin.on('end', () => {
      if (input.trim()) {
        const abcMetrics = calculateAbcWithTreeSitter(input);
        console.log("ABC Metric:", abcMetrics);
      } else {
        console.error("No input provided");
        process.exit(1);
      }
    });
  }
}

main();
