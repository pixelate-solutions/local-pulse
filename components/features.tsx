import { Building, Newspaper, Calendar } from 'lucide-react';

const data = [
  {
    title: 'Local Stories',
    text: 'See what’s happening all around you, filtered by distance.',
    icon: Building,
  },
  {
    title: 'Real-Time News',
    text: 'Instantly see breaking news or local events as they unfold.',
    icon: Newspaper,
  },
  {
    title: 'Daily Newsletter',
    text: 'Never miss a local news story with our built-in community newsletter.',
    icon: Calendar,
  },
];

const Features = () => (
  <section id="features" className="py-24 bg-gray-100">
    <div className="max-w-6xl mx-auto px-6 grid gap-12 md:grid-cols-3">
      {data.map(({ title, text, icon: Icon }) => (
        <div key={title} className="p-6 bg-white shadow-lg rounded-lg transform hover:-translate-y-2 transition">
          <Icon className="text-green-600 mb-4" size={48} />
          <h3 className="text-2xl font-semibold mb-2 text-gray-800">{title}</h3>
          <p className="text-gray-600">{text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;