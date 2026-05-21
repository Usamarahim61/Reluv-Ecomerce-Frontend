import ReluvGroupFooter from '../components/Reluv-Group-Footer';

import Sustainability from '../sustainability/page';
import Newsroom from '../newsroom/page';
import ReluvVentures from "../ReluvVentures/page";
import MediaAssets from "../mediaAssets/page"

export const dynamic = 'force-dynamic';

type Props = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

export default async function ReluvGroup({ searchParams }: Props) {
  const view = (await searchParams)?.view;

  return (
    <div className="flex min-h-screen flex-col">
    
      <main className="flex-grow">
        {view === 'sustainability' && <Sustainability />}
        {view === 'press' && <Newsroom />}
        {view === 'mediaAssets' && <MediaAssets />}
        {view === 'reluvVentures' && <ReluvVentures />}

        {/* {!view && <div className="py-20 text-center">Select a section</div>} */}

        {/* {view !== 'sustainability' && view !== 'press' && view && (
          <div className="py-20 text-center">Page not found</div>
        )} */}
      </main>

      <ReluvGroupFooter />
    </div>
  );
}
