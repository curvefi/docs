function markdownPath(permalink) {
  return `${permalink.endsWith('/') ? `${permalink}index` : permalink}.md`;
}

module.exports = {markdownPath};
