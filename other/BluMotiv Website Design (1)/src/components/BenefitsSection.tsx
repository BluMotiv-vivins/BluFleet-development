import { Check } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    'Increased vehicle range',
    'Better thermal & energy management',
    'Enhanced performance',
    'Longer battery lifespan',
    'Personalised driving experience',
    'Reduced energy waste'
  ];

  return (
    <section className="py-16 px-8 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl text-[#F0F8FE] text-center mb-12">
          Benefits of Intelligent Powertrain System
        </h2>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="border border-[#F0F8FE]/20 p-6 hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#304461' }}
            >
              <div className="flex items-start gap-4">
                {/* Tick-in-Circle Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-[#F0F8FE]" />
                </div>
                
                {/* Benefit Text */}
                <p className="text-[#F0F8FE]/90 leading-relaxed">
                  {benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}