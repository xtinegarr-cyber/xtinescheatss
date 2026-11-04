import { useParams, Link } from 'wouter';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Product: {slug}</h1>
        <p className="mt-2 text-[#a0a0b8]">Sale pricing will be restored shortly.</p>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-[#6C5CE7] px-6 py-3">Back to Store</Link>
      </div>
    </div>
  );
}
