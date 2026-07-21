import React, { useState } from "react";
import { Heart, Landmark, ExternalLink, FileText, Upload, X, CheckCircle2, Phone, Mail, Sparkles } from "lucide-react";
import { DynamicLucideIcon } from "./ToolkitSection";
import { ref, push, set } from "firebase/database";
import { db } from "../firebase";

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
  photoReqsEn?: string;
  photoReqsNp?: string;
  docReqsEn?: string;
  docReqsNp?: string;
  specialNoticeEn?: string;
  specialNoticeNp?: string;
  customQuestionsEn?: string;
  customQuestionsNp?: string;
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
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [localLevel, setLocalLevel] = useState("");
  const [ward, setWard] = useState("");
  const [tole, setTole] = useState("");
  const [temporaryAddress, setTemporaryAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState("Email");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Array<{ name: string; fileName: string; data: string }>>([]);

  const handleOpenApplyModal = (service: ServiceItem) => {
    setSelectedService(service);
    setIsApplyModalOpen(true);
    setSubmitted(false);
    setName("");
    setProvince("");
    setDistrict("");
    setLocalLevel("");
    setWard("");
    setTole("");
    setTemporaryAddress("");
    setContact("");
    setEmail("");
    setContactMethod("Email");
    setCustomAnswers({});
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => {
          const filtered = prev.filter(att => att.name !== fieldName);
          return [...filtered, { name: fieldName, fileName: file.name, data: reader.result as string }];
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomQuestionChange = (question: string, value: string) => {
    setCustomAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Contact number validation: Starts with +977 and exactly 10 digits starting with 9
    const contactCleaned = contact.trim();
    const phoneRegex = /^\+977\s?9\d{9}$/;
    if (!phoneRegex.test(contactCleaned)) {
      alert(
        lang === "en" 
          ? "Contact number must start with +977 and contain exactly 10 digits starting with 9 (e.g., +977 9XXXXXXXXX)" 
          : "सम्पर्क नम्बर +९७७ बाट सुरु हुनुपर्छ र ९ बाट सुरु हुने ठीक १० अंक हुनुपर्छ (जस्तै, +977 9XXXXXXXXX)"
      );
      return;
    }

    setLoading(true);

    try {
      const appRef = ref(db, "service_applications");
      const newAppRef = push(appRef);
      await set(newAppRef, {
        id: newAppRef.key,
        serviceId: selectedService.id,
        serviceTitle: selectedService.titleEn,
        name,
        permanentAddress: {
          province,
          district,
          localLevel,
          ward,
          tole
        },
        temporaryAddress,
        contact: contactCleaned,
        email,
        contactMethod,
        customAnswers,
        attachments,
        timestamp: new Date().toISOString()
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting service application:", err);
      alert(
        lang === "en" 
          ? "Failed to submit application. Please try again." 
          : "आवेदन बुझाउन असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।"
      );
    } finally {
      setLoading(false);
    }
  };

  // Parsing custom questions configured in CMS
  const customQuestions = selectedService
    ? (lang === "en" ? selectedService.customQuestionsEn : selectedService.customQuestionsNp)
      ? (lang === "en" ? selectedService.customQuestionsEn : selectedService.customQuestionsNp)!
          .split(",")
          .map(q => q.trim())
          .filter(Boolean)
      : []
    : [];

  // Parsing photo and doc requirements configured in CMS
  const photoRequirements = selectedService
    ? (lang === "en" ? selectedService.photoReqsEn : selectedService.photoReqsNp)
      ? (lang === "en" ? selectedService.photoReqsEn : selectedService.photoReqsNp)!
          .split(",")
          .map(r => r.trim())
          .filter(Boolean)
      : []
    : [];

  const docRequirements = selectedService
    ? (lang === "en" ? selectedService.docReqsEn : selectedService.docReqsNp)
      ? (lang === "en" ? selectedService.docReqsEn : selectedService.docReqsNp)!
          .split(",")
          .map(r => r.trim())
          .filter(Boolean)
      : []
    : [];

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

                {/* Actions: Apply Now & Official Link */}
                <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOpenApplyModal(service)}
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/10 cursor-pointer"
                    title={lang === "en" ? "Apply for this service" : "यस सेवाको लागि आवेदन दिनुहोस्"}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      {lang === "en" ? "Apply Now" : "अहिले आवेदन दिनुहोस्"}
                    </span>
                  </button>

                  {service.officialLink ? (
                    <a
                      href={service.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95"
                    >
                      <span>
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

      {/* ================= APPLY NOW MODAL OVERLAY ================= */}
      {isApplyModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {lang === "en" ? selectedService.priceEn : selectedService.priceNp}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-white mt-2">
                  {lang === "en" ? `Apply for: ${selectedService.titleEn}` : `आवेदन फारम: ${selectedService.titleNp}`}
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success State */}
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex p-4 rounded-full bg-cyan-500/10 text-cyan-400">
                  <CheckCircle2 className="h-16 w-16 animate-pulse" />
                </div>
                <h4 className="text-xl font-extrabold text-white">
                  {lang === "en" ? "Congratulations!" : "बधाई छ!"}
                </h4>
                <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                  {lang === "en"
                    ? "Congratulations! Your request has been submitted successfully and you will be contacted by the admin for more details soon."
                    : "बधाई छ! तपाईंको अनुरोध सफलतापूर्वक दर्ता भएको छ र थप विवरणहरूको लागि चाँडै प्रशासकले तपाईंसँग सम्पर्क गर्नुहुनेछ।"}
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    {lang === "en" ? "Close Portal" : "पोर्टल बन्द गर्नुहोस्"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* CMS Special Notice */}
                {(lang === "en" ? selectedService.specialNoticeEn : selectedService.specialNoticeNp) && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs flex items-start space-x-2.5">
                    <Sparkles className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-300 block mb-1">
                        {lang === "en" ? "Special Instructions / Notice:" : "विशेष निर्देशन / सूचना:"}
                      </span>
                      <p className="text-gray-300 leading-relaxed">
                        {lang === "en" ? selectedService.specialNoticeEn : selectedService.specialNoticeNp}
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 1: Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                    1. Personal Information / व्यक्तिगत विवरण
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                      {lang === "en" ? "Full Name *" : "पूरा नाम *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === "en" ? "Amit Joshi" : "अमित जोशी"}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Step 2: Permanent Address (Compulsory fields) */}
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                    2. Permanent Address / स्थायी ठेगाना (अनिवार्य)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                        {lang === "en" ? "Province *" : "प्रदेश *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="e.g., Sudurpashchim"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                        {lang === "en" ? "District *" : "जिल्ला *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g., Darchula"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                        {lang === "en" ? "Local Level Name (Municipality/RM) *" : "स्थानीय तहको नाम *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={localLevel}
                        onChange={(e) => setLocalLevel(e.target.value)}
                        placeholder="e.g., Duhu RM"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                          {lang === "en" ? "Ward No. *" : "वडा नम्बर *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          placeholder="e.g., 3"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                          {lang === "en" ? "Tole Name *" : "टोलको नाम *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={tole}
                          onChange={(e) => setTole(e.target.value)}
                          placeholder="e.g., Hikila"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Temporary Address */}
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                    3. Temporary Address / अस्थायी ठेगाना
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                      {lang === "en" ? "Current Temporary Address" : "हालको अस्थायी ठेगाना"}
                    </label>
                    <input
                      type="text"
                      value={temporaryAddress}
                      onChange={(e) => setTemporaryAddress(e.target.value)}
                      placeholder={lang === "en" ? "Koteshwor, Kathmandu" : "कोटेश्वर, काठमाडौं"}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Step 4: Contact & Verification Details */}
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                    4. Contact Details & verification / सम्पर्क विवरण र प्रमाणिकरण
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block flex items-center">
                        <span>{lang === "en" ? "Contact Number *" : "सम्पर्क नम्बर *"}</span>
                        <span className="ml-1 text-cyan-400 font-mono font-normal">({lang === "en" ? "+977 compulsory" : "+९७७ अनिवार्य"})</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="+977 9XXXXXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                        {lang === "en" ? "Official Email Address *" : "इमेल ठेगाना *"}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="official@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                      {lang === "en" ? "Preferred Contact Method *" : "पसन्द गरिएको सम्पर्क माध्यम *"}
                    </label>
                    <div className="flex space-x-4">
                      {["Email", "WhatsApp"].map((method) => (
                        <label key={method} className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="contactMethod"
                            value={method}
                            checked={contactMethod === method}
                            onChange={() => setContactMethod(method)}
                            className="text-cyan-500 focus:ring-0"
                          />
                          <span>{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 5: Dynamic Document upload */}
                {(photoRequirements.length > 0 || docRequirements.length > 0) && (
                  <div className="space-y-4">
                    <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1 flex items-center space-x-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{lang === "en" ? "5. Document Uploads *" : "५. आवश्यक कागजातहरू *"}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo Upload triggers */}
                      {photoRequirements.map((photoField, index) => {
                        const fileSelected = attachments.find(att => att.name === photoField);
                        return (
                          <div key={`photo-${index}`} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase truncate">
                              {photoField} *
                            </span>
                            <div className="flex items-center justify-between">
                              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 transition-colors">
                                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                                <span>{fileSelected ? "Change Photo" : "Upload Photo"}</span>
                                <input
                                  type="file"
                                  required={!fileSelected}
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, photoField)}
                                  className="hidden"
                                />
                              </label>
                              {fileSelected && (
                                <span className="text-[9px] font-mono text-cyan-400 truncate max-w-[120px]" title={fileSelected.fileName}>
                                  ✓ {fileSelected.fileName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Doc/PDF Upload triggers */}
                      {docRequirements.map((docField, index) => {
                        const fileSelected = attachments.find(att => att.name === docField);
                        return (
                          <div key={`doc-${index}`} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase truncate">
                              {docField} *
                            </span>
                            <div className="flex items-center justify-between">
                              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 transition-colors">
                                <Upload className="h-3.5 w-3.5 text-purple-400" />
                                <span>{fileSelected ? "Change PDF" : "Upload PDF/Doc"}</span>
                                <input
                                  type="file"
                                  required={!fileSelected}
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => handleFileChange(e, docField)}
                                  className="hidden"
                                />
                              </label>
                              {fileSelected && (
                                <span className="text-[9px] font-mono text-purple-400 truncate max-w-[120px]" title={fileSelected.fileName}>
                                  ✓ {fileSelected.fileName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 6: Dynamic Custom Questions */}
                {customQuestions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                      {lang === "en" ? "6. Additional Information" : "६. थप जानकारीहरू"}
                    </h4>
                    
                    <div className="space-y-4">
                      {customQuestions.map((question, idx) => (
                        <div key={`q-${idx}`} className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block">
                            {question}
                          </label>
                          <textarea
                            rows={2}
                            value={customAnswers[question] || ""}
                            onChange={(e) => handleCustomQuestionChange(question, e.target.value)}
                            placeholder={lang === "en" ? "Provide details..." : "विवरणहरू प्रदान गर्नुहोस्..."}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-gray-300 transition-colors cursor-pointer"
                  >
                    {lang === "en" ? "Cancel" : "रद्द गर्नुहोस्"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-cyan-500 text-black hover:bg-cyan-400 font-bold uppercase text-xs tracking-wider rounded-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>
                      {loading 
                        ? (lang === "en" ? "Submitting..." : "बुझाउँदै...") 
                        : (lang === "en" ? "Submit Application" : "आवेदन बुझाउनुहोस्")}
                    </span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
