import { redirect } from 'next/navigation';

export default async function ExecutiveDevelopersRoot({ 
  params,
  searchParams
}: { 
  params: Promise<{ org_slug: string, project_slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { org_slug, project_slug } = await params;
  const search = await searchParams;
  const clientType = search.clientType ? `?clientType=${search.clientType}` : '';
  
  redirect(`/${org_slug}/projects/${project_slug}/executive-developers/project/overview${clientType}`);
}
