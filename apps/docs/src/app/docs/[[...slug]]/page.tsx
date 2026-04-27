import { getGithubLastEdit } from 'fumadocs-core/server';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { source } from '@/lib/source';

interface Props {
  params: Promise<{ slug?: string[] }>;
}

// page.data fields come from fumadocs-mdx at build time; cast to any for pre-build typecheck
// biome-ignore lint/suspicious/noExplicitAny: generated types not available before first build
type PageData = any;

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const data = page.data as PageData;
  return {
    title: data.title as string,
    description: data.description as string | undefined,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const data = page.data as PageData;
  const MDX = data.body as React.FC;

  const lastModified = await getGithubLastEdit({
    owner: 'KiteID',
    repo: 'kiteid',
    path: `apps/docs/content/docs/${page.file.path}`,
  })
    .then((d) => d ?? undefined)
    .catch(() => undefined);

  return (
    <DocsPage toc={data.toc} lastUpdate={lastModified} full={data.full}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}
