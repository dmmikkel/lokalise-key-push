const parser = require('properties-parser');

module.exports = (data) => {
  const parsed = parser.parse(data);
  const output = [];
  for (const key in parsed) {
    output.push({
      key,
      value: parsed[key]
    });
  }
  return output;
}