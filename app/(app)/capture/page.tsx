import CaptureForm from '@/components/capture/CaptureForm';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Capture' };

export default async function CapturePage() {
  const supabase = await createClient();
  const { data: sources } = await supabase
    .from('sources')
    .select('id, type, name, detail')
    .order('name');

  return <CaptureForm sources={sources ?? []} />;
}
