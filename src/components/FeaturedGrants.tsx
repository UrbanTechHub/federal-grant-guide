import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Building, ArrowRight, Clock } from "lucide-react";

const featuredGrants = [
  { id: 1, title: "Small Business Innovation Research (SBIR) Phase I", agency: "National Science Foundation", agencyAbbr: "NSF", amount: "$50,000 - $275,000", deadline: "March 15, 2026", daysLeft: 44, category: "Research", description: "Supports early-stage research and development of innovative technologies with commercial potential.", isUrgent: false },
  { id: 2, title: "Community Development Block Grant Program", agency: "Dept. of Housing & Urban Development", agencyAbbr: "HUD", amount: "$100,000 - $5,000,000", deadline: "February 28, 2026", daysLeft: 29, category: "Housing", description: "Funding for community development activities addressing housing, economic development, and public facilities.", isUrgent: true },
  { id: 3, title: "Environmental Education Grants Program", agency: "Environmental Protection Agency", agencyAbbr: "EPA", amount: "$50,000 - $100,000", deadline: "April 1, 2026", daysLeft: 61, category: "Environment", description: "Supports environmental education projects that promote awareness and stewardship of natural resources.", isUrgent: false },
  { id: 4, title: "Rural Business Development Grant", agency: "U.S. Department of Agriculture", agencyAbbr: "USDA", amount: "$10,000 - $500,000", deadline: "February 20, 2026", daysLeft: 21, category: "Business", description: "Supports targeted technical assistance and training for small rural businesses.", isUrgent: true },
];

const FeaturedGrants = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-gov">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
              Featured Opportunities
            </span>
            <h2 className="font-display">Latest grant opportunities</h2>
            <p className="text-muted-foreground mt-2 text-lg">Explore current funding opportunities from federal agencies.</p>
          </div>
          <Link to="/apply">
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {featuredGrants.map((grant) => (
            <div key={grant.id} className="card-gov group">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {grant.category}
                </span>
                {grant.isUrgent && (
                  <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Closing Soon
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-colors font-display mb-3">
                {grant.title}
              </h3>

              <p className="text-muted-foreground text-sm mb-5 line-clamp-2">{grant.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{grant.agencyAbbr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{grant.amount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{grant.deadline}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">{grant.daysLeft} days remaining</span>
                <Link to="/apply">
                  <Button variant="hero" size="sm">
                    Apply
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGrants;
