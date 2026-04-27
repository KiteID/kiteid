import { loader } from 'fumadocs-core/source';
import { docs } from '@/.source';

// biome-ignore lint/suspicious/noExplicitAny: types generated at build time by fumadocs-mdx
export const source = loader({
  baseUrl: '/docs',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: (docs as any).toFumadocsSource(),
});

export type SourcePage = ReturnType<typeof source.getPage>;
