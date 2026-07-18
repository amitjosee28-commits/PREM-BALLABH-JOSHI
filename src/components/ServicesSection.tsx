import { Heart, Landmark, HelpCircle, ExternalLink, MessageSquare } from "lucide-react";
import { DynamicLucideIcon } from "./ToolkitSection";

interface ServiceItem {
  id: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  priceEn: string;
  priceNp: string;
  whatsappMessageEn: string;
  whatsappMessageNp: string;
  officialLink: string;
  icon: string;
}

interface InterestItem {
  id: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  icon: string;
}

interface ServicesSectionProps {
  services: ServiceItem[];
  interests: InterestItem[];
  lang: "en" | "np";
}

export default function ServicesSection({ services, interests, lang }: ServicesSectionProps) {
  
  // Triggers automated WhatsApp text injection parsing
  const handleHelpMeFill = (service: ServiceItem) => {
    const rawMessage = lang === "en" ? service.whatsappMessageEn : service.whatsappMessageNp;
    const phone = "9779800000000"; // Amit's pre-configured official number
    const encodedText = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(url, "_blank", "referrer");
  };

  return (
    <section id="services-section" className="py-20 relative border-t border-white/5 scroll-mt-24">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* ================= SERVICES SUB-SECTION ================= */}
        <div className="mb-24">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
              <Landmark className="h-4 w-4 text-cyan-400" />
              <span 
                className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase"
                data-en="Premium Services"
                data-np="व्यावसायिक सेवाहरू"
              >
                {lang === "en" ? "Premium Services" : "व्यावसायिक सेवाहरू"}
              </span>
            </div>
            <h2 
              className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans"
              data-en="Professional Services Array"
              data-np="व्यावसायिक सेवा संरचना"
            >
              {lang === "en" ? "Professional Services Array" : "व्यावसायिक सेवा संरचना"}
            </h2>
            <p 
              className="text-gray-400 mt-3 max-w-xl mx-auto text-sm"
              data-en="Consulting pipelines, advanced reactive CMS setups, and enterprise application diagnostics."
              data-np="परामर्श पाइपलाइन, उन्नत प्रतिक्रियाशील CMS सेटअपहरू, र इन्टरप्राइज अनुप्रयोग निदान।"
            >
              {lang === "en" ? "Consulting pipelines, advanced reactive CMS setups, and enterprise application diagnostics." : "परामर्श पाइपलाइन, उन्नत प्रतिक्रियाशील CMS सेटअपहरू, र इन्टरप्राइज अनुप्रयोग निदान।"}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services && services.map((service) => (
              <div
                key={service.id}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-cyan-500/35 transition-all duration-300 backdrop-blur-md shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon & Price Row */}
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all duration-300">
                      <DynamicLucideIcon name={service.icon} className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
                      {lang === "en" ? service.priceEn : service.priceNp}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors">
                      {lang === "en" ? service.titleEn : service.titleNp}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {lang === "en" ? service.descriptionEn : service.descriptionNp}
                    </p>
                  </div>
                </div>

                {/* Service Card Actions: Help Me Fill & Official Link */}
                <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleHelpMeFill(service)}
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
                    title={lang === "en" ? "Send automated query to WhatsApp" : "व्हाट्सएपमा स्वचालित सन्देश पठाउनुहोस्"}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span data-en="Help Me Fill" data-np="सहयोग गर्नुहोस्">
                      {lang === "en" ? "Help Me Fill" : "सहयोग गर्नुहोस्"}
                    </span>
                  </button>

                  {service.officialLink ? (
                    <a
                      href={service.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95"
                    >
                      <span data-en="Official Info" data-np="आधिकारिक जानकारी">
                        {lang === "en" ? "Official Info" : "आधिकारिक जानकारी"}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <div className="px-3 py-2.5 text-center text-[10px] font-mono text-gray-500 uppercase border border-dashed border-white/5 rounded-xl">
                      {lang === "en" ? "Internal ONLY" : "आन्तरिक मात्र"}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>


        {/* ================= PASSIONS / INTERESTS PORTAL ================= */}
        <div>
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-3">
              <Heart className="h-4 w-4 text-purple-400" />
              <span 
                className="text-xs font-mono font-bold tracking-wider text-purple-400 uppercase"
                data-en="Personal Passions"
                data-np="व्यक्तिगत रुचिहरू"
              >
                {lang === "en" ? "Personal Passions" : "व्यक्तिगत रुचिहरू"}
              </span>
            </div>
            <h2 
              className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans"
              data-en="Interests & Passions Portal"
              data-np="रुचि र चाहना पोर्टल"
            >
              {lang === "en" ? "Interests & Passions Portal" : "रुचि र चाहना पोर्टल"}
            </h2>
            <p 
              className="text-gray-400 mt-3 max-w-xl mx-auto text-sm"
              data-en="What moves Amit beyond direct keyboard commands and active database loops."
              data-np="प्रत्यक्ष किबोर्ड कमाण्ड र सक्रिय डाटाबेस लुपहरू भन्दा बाहिर अमितलाई केले आकर्षित गर्छ।"
            >
              {lang === "en" ? "What moves Amit beyond direct keyboard commands and active database loops." : "प्रत्यक्ष किबोर्ड कमाण्ड र सक्रिय डाटाबेस लुपहरू भन्दा बाहिर अमितलाई केले आकर्षित गर्छ।"}
            </p>
          </div>

          {/* Interests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {interests && interests.map((interest) => (
              <div
                key={interest.id}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.01] p-5 hover:bg-white/[0.03] hover:border-purple-500/35 transition-all duration-300 backdrop-blur-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all duration-300 flex-shrink-0">
                    <DynamicLucideIcon name={interest.icon} className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                      {lang === "en" ? interest.titleEn : interest.titleNp}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {lang === "en" ? interest.descriptionEn : interest.descriptionNp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
