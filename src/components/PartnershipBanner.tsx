import usaidSeal from "@/assets/usaid-seal.png";

const PartnershipBanner = () => {
  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container-gov">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <img src={usaidSeal} alt="USAID Seal" className="w-40 h-40 md:w-48 md:h-48 object-contain flex-shrink-0" />
          <div>
            <span className="inline-block bg-secondary/20 text-secondary-foreground px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wide border border-secondary/30">
              Official Partnership
            </span>
            <h2 className="font-display text-primary-foreground mb-4">
              Allies for Community Business in Partnership with USAID
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mb-4">
              The Allies for Community Business program operates in partnership with the United States Agency for International Development (USAID) to deliver critical federal grant funding to communities across America. Together, we are committed to empowering small businesses, non-profits, and community organizations through accessible financial support and development programs.
            </p>
            <p className="text-primary-foreground/60 text-sm max-w-2xl">
              This partnership ensures that every application is processed with the full backing of the U.S. federal government, providing transparency, accountability, and impact at every level.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipBanner;
