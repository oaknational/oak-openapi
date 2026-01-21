import type { Metadata } from 'next';
import Playground from './Playground';

export const metadata: Metadata = {
  title: 'Oak Curriculum API Playground',
};

export default function Page(): React.ReactElement {
  return (
    <>
      <Playground />
    </>
  );
}
