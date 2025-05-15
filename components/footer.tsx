import Link from 'next/link';

function handleScroll(id: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };
}

const Footer = () => (
  <footer className="bg-gray-800 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h4 className="text-white text-lg font-semibold mb-2">LocalPulse</h4>
        <p className="text-sm">Connecting neighbors through shared news and stories.</p>
      </div>
      <div className="flex flex-col space-y-2">
        <a href="#features" onClick={handleScroll('features')} className="hover:text-white">Features</a>
        <a href="#about" onClick={handleScroll('about')} className="hover:text-white">About</a>
        <a href="#cta" onClick={handleScroll('cta')} className="hover:text-white">Get Started</a>
      </div>
      <div className="flex space-x-4">
        <a href="#" className="hover:text-white text-xl">X</a>
        <a href="#" className="hover:text-white text-xl">Facebook</a>
        <a href="#" className="hover:text-white text-xl">Instagram</a>
      </div>
    </div>
    <div className="mt-8 text-center text-sm">&copy; {new Date().getFullYear()} LocalPulse. All Rights Reserved.</div>
  </footer>
);

export default Footer;