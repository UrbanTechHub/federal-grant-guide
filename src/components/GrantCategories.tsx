import { Link } from "react-router-dom";
import {
  GraduationCap,
  Microscope,
  Building2,
  HeartPulse,
  Leaf,
  Shield,
  Briefcase,
  Home,
  ArrowRight,
} from "lucide-react";

const categories = [
  { icon: GraduationCap, title: "Education", description: "Scholarships, student loans, and educational institution funding", grants: 450 },
  { icon: Microscope, title: "Research & Science", description: "Scientific research, R&D, and innovation grants", grants: 380 },
  { icon: Building2, title: "Small Business", description: "SBIR/STTR programs and business development grants", grants: 290 },
  { icon: HeartPulse, title: "Health & Human Services", description: "Healthcare, mental health, and social services funding", grants: 520 },
  { icon: Leaf, title: "Environment", description: "Environmental protection and sustainability initiatives", grants: 180 },
  { icon: Shield, title: "Public Safety", description: "Law enforcement, emergency services, and homeland security", grants: 150 },
  { icon: Briefcase, title: "Agriculture", description: "Farm support, rural development, and food programs", grants: 220 },
  { icon: Home, title: "Housing & Community", description: "Affordable housing and community development programs", grants: 310 },
];

const GrantCategories = () => {
  return (
    <section id="grants" className="section-padding bg-background">
      <div className="container-gov">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
            Grant Categories
          </span>
          <h2 className="mb-4 font-display">Find the right funding for your project</h2>
          <p className="text-muted-foreground text-lg">
            Browse federal funding opportunities by category to find the right fit for your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <Link
              key={category.title}
              to="/apply"
              className="card-gov group flex flex-col"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <category.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-display">{category.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{category.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary font-medium">{category.grants} grants</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GrantCategories;
