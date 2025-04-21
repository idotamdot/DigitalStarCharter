import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const ProcessSection = () => {
  const steps = [
    {
      number: 1,
      title: "Define Your Business",
      description:
        "Complete our business profile questionnaire to clarify your vision, goals, and target audience.",
    },
    {
      number: 2,
      title: "Develop Your Brand",
      description:
        "Create your brand identity including logo, colors, and messaging that resonates with your audience.",
    },
    {
      number: 3,
      title: "Build Your Website",
      description:
        "Use our website builder to create a professional, conversion-focused website for your business.",
    },
    {
      number: 4,
      title: "Set Up Marketing",
      description:
        "Establish your social media presence and develop a content strategy to reach your audience.",
    },
    {
      number: 5,
      title: "Launch & Grow",
      description:
        "Launch your business online and implement strategies for continuous growth and improvement.",
    },
  ];

  return (
    <section className="py-16 bg-white" id="process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our structured process guides you through each step of building your
            digital presence
          </p>
        </div>

        <div className="relative">
          {/* Progress line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4 z-10 border-4 border-white">
                  <span className="text-xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/business-wizard">
            <Button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:from-primary-700 hover:to-secondary-700 transition-colors shadow-md">
              Start Your Business Journey
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
