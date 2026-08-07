import { redirect } from 'next/navigation';

export default async function ExecutiveDevelopersRoot({ 
  searchParams
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const search = await searchParams;
  const clientType = search.clientType ? `?clientType=${search.clientType}` : '';
  
  redirect(`/main-dashboard/executive-developers/project/overview${clientType}`);
}
