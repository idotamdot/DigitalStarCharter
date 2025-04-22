import { Star, Globe, Users, Sparkles, Brain, DollarSign, Code } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: "star",
      color: "yellow",
      title: "Equitable Profit Distribution",
      description:
        "All members who complete their weekly assigned tasks receive equal profit distribution, regardless of role or seniority.",
      benefits: [
        "Transparent weekly payments",
        "Equal share based on contribution",
        "No hierarchy in compensation",
        "Direct deposits to your account",
      ],
    },
    {
      icon: "globe",
      color: "blue",
      title: "Continental Constellations",
      description:
        "Join a regional network of technical professionals organized by continent, with each member represented as a star in our celestial ecosystem.",
      benefits: [
        "Regional collaboration networks",
        "Guided by 'Guiding Stars'",
        "30 areas per continental region",
        "30 members per area maximum",
      ],
    },
    {
      icon: "users",
      color: "purple",
      title: "Community Governance",
      description:
        "The 'North Star Council' comprised of the first 30 members governs the platform with transparent, democratic decision-making processes.",
      benefits: [
        "15 UX Designers on council",
        "15 Full Stack/Developers on council",
        "Rotating area voters",
        "Unanimous consensus model",
      ],
    },
    {
      icon: "brain",
      color: "green",
      title: "AI-Driven Task Allocation",
      description:
        "Our AI system assesses your skills and assigns tasks that match your expertise, ensuring optimal productivity and job satisfaction.",
      benefits: [
        "Skill-based task matching",
        "Weekly task assignments",
        "Performance analytics",
        "Adaptive learning system",
      ],
    },
    {
      icon: "code",
      color: "pink",
      title: "Flexible Role Changes",
      description:
        "Change your role at any time and upgrade your skills through our comprehensive training modules to explore new opportunities.",
      benefits: [
        "On-demand role switching",
        "Cross-discipline training",
        "Skill certification",
        "Career path flexibility",
      ],
    },
    {
      icon: "sparkles",
      color: "teal",
      title: "Enhanced Service Tiers",
      description:
        "Access premium services and resources as you grow, with appointment scheduling for consultations with specialized experts.",
      benefits: [
        "Service provider booking",
        "Expertise access scaling",
        "Premium resource library",
        "Priority support access",
      ],
    },
  ];

  // Custom icon component with color variations
  const IconComponent = ({ icon, color }: { icon: string; color: string }) => {
    const colorClass = {
      yellow: "text-yellow-400",
      blue: "text-blue-500",
      purple: "text-purple-500",
      green: "text-emerald-500",
      pink: "text-pink-500",
      teal: "text-teal-500",
    }[color] || "text-blue-500";

    const bgColorClass = {
      yellow: "bg-yellow-100/20",
      blue: "bg-blue-100/20",
      purple: "bg-purple-100/20",
      green: "bg-emerald-100/20",
      pink: "bg-pink-100/20",
      teal: "bg-teal-100/20",
    }[color] || "bg-blue-100/20";

    const iconComponents = {
      star: <Star className={`w-6 h-6 ${colorClass}`} />,
      globe: <Globe className={`w-6 h-6 ${colorClass}`} />,
      users: <Users className={`w-6 h-6 ${colorClass}`} />,
      brain: <Brain className={`w-6 h-6 ${colorClass}`} />,
      code: <Code className={`w-6 h-6 ${colorClass}`} />,
      sparkles: <Sparkles className={`w-6 h-6 ${colorClass}`} />,
      dollar: <DollarSign className={`w-6 h-6 ${colorClass}`} />,
    };

    return (
      <div className={`w-14 h-14 rounded-full ${bgColorClass} flex items-center justify-center`}>
        {iconComponents[icon as keyof typeof iconComponents]}
      </div>
    );
  };

  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden" id="features">
      {/* Background star effect */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-yellow-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-teal-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center p-2 bg-blue-900/30 rounded-full">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our Celestial Ecosystem Features
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Digital Presence creates a revolutionary remote work model where technical professionals collaborate 
            in a profit-sharing ecosystem guided by our unique celestial governance structure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all group"
            >
              <div className="p-8">
                <div className="mb-5 transition-transform group-hover:scale-110 duration-300">
                  <IconComponent icon={feature.icon} color={feature.color} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                <ul className="space-y-3 text-sm">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span 
                        className={`mr-2 mt-1`} 
                        style={{ 
                          color: feature.color === 'yellow' ? '#FBBF24' : 
                                 feature.color === 'blue' ? '#3B82F6' : 
                                 feature.color === 'purple' ? '#A855F7' : 
                                 feature.color === 'green' ? '#10B981' : 
                                 feature.color === 'pink' ? '#EC4899' : 
                                 feature.color === 'teal' ? '#14B8A6' : '#3B82F6' 
                        }}
                      >
                        ★
                      </span>
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
            Join our growing network of stars across seven continental constellations and help shape
            the future of collaborative, equitable remote work.
          </p>
          <a href="/join" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors">
            <Star className="mr-2 h-5 w-5" />
            Join Our Constellation
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
