import PaperBuilder from '@/components/features/paper-builder/components/paper-builder';

export default async function PaperBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaperBuilder id={id} />;
}
