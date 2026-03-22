import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GrantCategories from "@/components/GrantCategories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedGrants from "@/components/FeaturedGrants";
import CallToAction from "@/components/CallToAction";
import PartnershipBanner from "@/components/PartnershipBanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PartnershipBanner />
        <GrantCategories />
        <HowItWorks />
        <FeaturedGrants />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
