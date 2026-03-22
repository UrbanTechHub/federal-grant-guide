import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import usaidSeal from "@/assets/usaid-seal.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="bg-primary text-primary-foreground">
      {/* Red top stripe */}
      <div className="h-1 bg-secondary" />

      <div className="container-gov py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img src={logo} alt="Federal Grant" className="h-12 w-auto brightness-0 invert" />
              <span className="text-lg font-bold font-display text-primary-foreground">Federal Grant</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm max-w-xs mb-4">
              The official gateway to federal grant opportunities. Connecting organizations with government funding.
            </p>
            <div className="flex items-center gap-3 mb-6">
              <img src={usaidSeal} alt="USAID" className="w-10 h-10 object-contain" />
              <p className="text-primary-foreground/60 text-xs leading-tight">In Partnership with<br /><span className="font-semibold text-primary-foreground/80">USAID</span></p>
            </div>
            <p className="text-primary-foreground/50 text-xs">
              support@federalgrants.gov<br />
              1-800-FED-GRANTS
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Programs",
              links: [
                { label: "All Grants", to: "/apply" },
                { label: "Education", to: "/apply" },
                { label: "Research", to: "/apply" },
                { label: "Small Business", to: "/apply" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "How to Apply", to: "#how-it-works" },
                { label: "Guides", to: "#resources" },
                { label: "FAQs", to: "#resources" },
                { label: "Webinars", to: "#resources" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy", to: "#about" },
                { label: "Terms", to: "#about" },
                { label: "Accessibility", to: "#about" },
                { label: "FOIA", to: "#about" },
              ],
            },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-xs uppercase tracking-widest mb-4 text-primary-foreground/50 font-display">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-gov py-6">
          <p className="text-xs text-primary-foreground/50 text-center">
            © {currentYear} Federal Grant — Allies for Community Business. An official website of the United States Government.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
