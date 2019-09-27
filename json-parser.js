function objectToKeyValuePairs (o, prefix = '') {
  const names = [];
  for (let key in o) {
    if (typeof o[key] === 'object') {
      const children = objectToKeyValuePairs(o[key], prefix + key + '::');
      children.forEach(c => names.push(c));
    } else {
      names.push({ key: prefix + key, value: o[key] });
    }
  }
  return names;
}

module.exports = (data) => {
  console.log('parsing json', data);
  const json = JSON.parse(data);
  return objectToKeyValuePairs(json); 
}