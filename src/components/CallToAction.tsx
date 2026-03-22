import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Rocket, Shield } from "lucide-react";

const CallToAction = () => {
  return (
    <section id="resources" className="section-padding bg-muted/50">
      <div className="container-gov">
        {/* Main CTA */}
        <div className="relative rounded-lg overflow-hidden p-10 md:p-16 mb-16 bg-secondary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-background blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-secondary-foreground mb-4 font-display">
              Ready to make an impact?
            </h2>
            <p className="text-secondary-foreground/80 text-lg mb-8">
              Apply now to access grants for research, community projects, small businesses, and more. Our team is here to help you every step of the way.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/apply">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold" size="lg">
                  Start Application
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Lightbulb, title: "Grant Alerts", desc: "Personalized notifications for new grants matching your criteria.", color: "bg-secondary" },
            { icon: Rocket, title: "Application Guides", desc: "Step-by-step resources to help you prepare a winning proposal.", color: "bg-primary" },
            { icon: Shield, title: "Help Center", desc: "Get answers to frequently asked questions and contact support.", color: "bg-secondary" },
          ].map((item) => (
            <Link key={item.title} to="/apply" className="card-gov group flex flex-col">
              <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-display">{item.title}</h3>
              <p className="text-sm text-muted-foreground flex-1">{item.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-secondary">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
