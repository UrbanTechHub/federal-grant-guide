import { Link } from "react-router-dom";
import { Search, FileCheck, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Search, step: "01", title: "Search & Discover", description: "Browse our comprehensive database of federal grants filtered by agency, category, or funding amount." },
  { icon: FileCheck, step: "02", title: "Review Eligibility", description: "Each grant listing includes detailed eligibility requirements. Review criteria to ensure qualification." },
  { icon: Send, step: "03", title: "Prepare & Submit", description: "Follow the application guidelines and submit required documents through our secure portal." },
  { icon: CheckCircle2, step: "04", title: "Track & Receive", description: "Monitor your application status. Approved grants are disbursed according to the program timeline." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-primary text-primary-foreground">
      <div className="container-gov">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block bg-secondary/20 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide border border-secondary/30">
            Simple Process
          </span>
          <h2 className="mb-4 font-display text-primary-foreground">How to apply for federal grants</h2>
          <p className="text-primary-foreground/70 text-lg">
            Our streamlined process makes it easy to find and apply for federal funding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-6 h-full backdrop-blur-sm">
                <div className="text-5xl font-bold font-display text-secondary/30 mb-3">{step.step}</div>
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-display text-primary-foreground">{step.title}</h3>
                <p className="text-primary-foreground/70 text-sm">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-primary-foreground/20" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link to="/apply">
            <Button variant="hero" size="lg">
              Start Your Application
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
