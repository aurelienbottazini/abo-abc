#!/usr/bin/env node

const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");

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

// --- Example Usage ---
const sampleCode = `
function calculateTotalPrice(price, quantity, discount) {
  let total = price * quantity;
  if (discount && discount > 0) {
    total -= (total * discount) / 100;
  }
  return total;
}

const itemPrice = 50;
let itemCount = 2;
const discountPercentage = 10;

const finalPrice = calculateTotalPrice(itemPrice, itemCount, discountPercentage);
console.log("Final price:", finalPrice);
`;

const abcMetrics = calculateAbcWithTreeSitter(sampleCode);

console.log("ABC Metric (from Tree-sitter):", abcMetrics);
