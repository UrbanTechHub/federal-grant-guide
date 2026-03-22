import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Clock, CheckCircle2, AlertCircle, Loader2, Users, DollarSign, Award, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import usaidSeal from "@/assets/usaid-seal.png";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  status: "found" | "not-found";
  applicationNumber?: string;
  applicantName?: string;
  grantType?: string;
  applicationStatus?: string;
  submittedAt?: string;
}

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const { data, error } = await supabase
        .from("grant_applications")
        .select("application_number, first_name, last_name, grant_type, status, created_at")
        .eq("application_number", searchQuery.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        setSearchResult({ status: "not-found" });
      } else if (data) {
        setSearchResult({
          status: "found",
          applicationNumber: data.application_number,
          applicantName: `${data.first_name} ${data.last_name}`,
          grantType: data.grant_type,
          applicationStatus: data.status,
          submittedAt: new Date(data.created_at).toLocaleDateString(),
        });
      } else {
        setSearchResult({ status: "not-found" });
      }
    } catch {
      setSearchResult({ status: "not-found" });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  return (
    <section className="relative pt-28 pb-0 overflow-hidden">
      {/* Hero with background image */}
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>

        <div className="container-gov relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="py-16 lg:py-24">
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in border border-secondary/30">
                <img src={usaidSeal} alt="USAID" className="w-5 h-5 object-contain" />
                <span className="text-primary-foreground">Allies for Community Business — In Partnership with USAID</span>
              </div>

              <h1 className="mb-6 animate-fade-in font-display leading-[1.15] text-primary-foreground" style={{ animationDelay: "0.1s" }}>
                Federal Grants for{" "}
                <span className="text-secondary">Working People</span>
              </h1>

              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Access thousands of federal grant opportunities. Find funding for research, community projects, and small businesses across America.
              </p>

              {/* CTA Buttons */}
              {!searchResult && (
                <div className="flex flex-wrap items-center gap-4 mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <Link to="/apply">
                    <Button variant="hero" size="lg">
                      Apply Now
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button variant="heroOutline" size="lg" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      Learn More
                    </Button>
                  </a>
                </div>
              )}

              {/* Search Bar */}
              <div className="max-w-md animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <label className="text-sm font-medium text-primary-foreground/70 mb-2 block">Track your application</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g., FG-2026-ABC123"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value.toUpperCase());
                        if (searchResult) setSearchResult(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full h-11 pl-10 pr-4 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-sm"
                    />
                  </div>
                  <Button variant="hero" size="sm" onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="h-11">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResult && (
                <div className="animate-fade-in mt-4 max-w-md">
                  {searchResult.status === "found" ? (
                    <div className="bg-background rounded-lg p-5 shadow-gov-medium">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-2 text-sm">Application Found</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">App #:</span> <span className="text-foreground font-medium">{searchResult.applicationNumber}</span></div>
                            <div><span className="text-muted-foreground">Applicant:</span> <span className="text-foreground font-medium">{searchResult.applicantName}</span></div>
                            <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground font-medium">{searchResult.grantType}</span></div>
                            <div><span className="text-muted-foreground">Submitted:</span> <span className="text-foreground font-medium">{searchResult.submittedAt}</span></div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            <span className="text-secondary font-medium capitalize text-sm">{searchResult.applicationStatus?.replace(/_/g, " ")}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground p-0 h-auto text-xs" onClick={clearSearch}>Search another</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-background rounded-lg p-5 shadow-gov-medium">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 text-sm">Not Found</h4>
                          <p className="text-sm text-muted-foreground">No application with number "{searchQuery}".</p>
                          <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground p-0 h-auto text-xs" onClick={clearSearch}>Try again</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Spacer for image */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-secondary">
        <div className="container-gov py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Award, value: "2,400+", label: "Active Grants" },
              { icon: DollarSign, value: "$12B", label: "Total Funding" },
              { icon: Users, value: "15K+", label: "Organizations" },
              { icon: Star, value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3">
                <stat.icon className="w-6 h-6 text-secondary-foreground/70 hidden sm:block" />
                <div className="text-left">
                  <p className="text-xl md:text-2xl font-bold font-display text-secondary-foreground">{stat.value}</p>
                  <p className="text-xs text-secondary-foreground/70">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
