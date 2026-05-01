import { type DocsCollection, defineConfig, defineDocs } from 'fumadocs-mdx/config';

// biome-ignore lint/suspicious/noExplicitAny: type annotation required to avoid TS2883 with zod inference
export const docs: DocsCollection<any, any> = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {},
});
