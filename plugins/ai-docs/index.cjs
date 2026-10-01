const {generate} = require('./generate.cjs');

module.exports = function aiDocs() {
  let docs = [];
  return {
    name: 'curve-ai-docs',
    allContentLoaded({allContent}) {
      docs = Object.values(allContent['docusaurus-plugin-content-docs'])
        .flatMap((content) => content.loadedVersions.flatMap((version) => version.docs))
        .filter((doc) => !doc.frontMatter.draft && !doc.frontMatter.unlisted);
    },
    async postBuild({siteDir, outDir, siteConfig}) {
      await generate({docs, siteDir, outDir, siteUrl: siteConfig.url});
    },
  };
};
