import { loader } from 'fumadocs-core/source';
import { docs } from '@/.source';

export const source = loader({
  baseUrl: '/',
  // biome-ignore lint/suspicious/noExplicitAny: types generated at build time by fumadocs-mdx
  source: (docs as any).toFumadocsSource(), // eslint-disable-line @typescript-eslint/no-explicit-any
});

export type SourcePage = ReturnType<typeof source.getPage>;
