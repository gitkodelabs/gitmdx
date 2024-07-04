const serialise = async (source) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = source.match(frontmatterRegex);

  let frontMatter = {};
  let body = source;

  if (match) {
      const frontMatterStr = match[1].trim(); // Get frontmatter string and trim any surrounding whitespace
      try {
          const jsonStr = frontMatterStr.replace(/'([^']*)'/g, '"$1"');
          frontMatter = parseFrontMatter(jsonStr);
          body = source.replace(match[0], ''); // Remove frontmatter from body
      } catch (error) {
          console.error('Error parsing frontMatter:', error);
          throw new Error('Failed to parse frontMatter.');
      }
  }

  return { frontMatter, body };
};

function parseFrontMatter(input) {
  const obj = {};

  input.split('\n').forEach(line => {
      const [key, value] = line.split(':').map(part => part.trim());
      if (key && value) {
          let parsedValue = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
          if (parsedValue === 'true') {
              obj[key] = true;
          } else if (parsedValue === 'false') {
              obj[key] = false;
          } else {
              obj[key] = parsedValue;
          }
      }
  });

  return obj;
}
  export { serialise };