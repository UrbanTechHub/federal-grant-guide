import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrantApplicationForm from "@/components/GrantApplicationForm";
import PartnershipBanner from "@/components/PartnershipBanner";
import { Shield, Clock, HelpCircle } from "lucide-react";

const ApplyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-12 bg-primary">
          <div className="container-gov relative">
            <div className="max-w-3xl">
              <h1 className="text-primary-foreground mb-4 font-display">
                Apply for a <span className="text-accent">Grant</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Complete the application form below. All information is encrypted and securely transmitted.
              </p>
            </div>
          </div>
        </section>

        {/* Info Bar */}
        <section className="border-b border-border bg-muted/50">
          <div className="container-gov py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Estimated time: 15-20 min</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>256-bit SSL</span>
                </div>
              </div>
              <a href="#help" className="flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-colors">
                <HelpCircle className="w-4 h-4" />
                Need help?
              </a>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="section-padding">
          <div className="container-gov">
            <GrantApplicationForm />
          </div>
        </section>

        {/* Help Section */}
        <section id="help" className="section-padding bg-muted/50 border-t border-border">
          <div className="container-gov">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-display">Need Assistance?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is available Monday-Friday, 8AM-6PM EST.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="tel:1-800-FED-GRANTS" className="text-primary font-semibold hover:opacity-80 transition-colors">
                  📞 1-800-FED-GRANTS
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a href="mailto:support@federalgrants.gov" className="text-primary font-semibold hover:opacity-80 transition-colors">
                  ✉️ support@federalgrants.gov
                </a>
              </div>
            </div>
          </div>
        </section>
        <PartnershipBanner />
      </main>

      <Footer />
    </div>
  );
};

export default ApplyPage;
