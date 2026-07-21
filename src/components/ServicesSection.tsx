import React, { useState } from "react";
import { Heart, Landmark, ExternalLink, FileText, Upload, X, CheckCircle2, Phone, Mail, Sparkles, Printer, ArrowLeft } from "lucide-react";
import { DynamicLucideIcon } from "./ToolkitSection";
import { ref, push, set, get } from "firebase/database";
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
  
  // New Dynamic Configurations
  pdfEnabled?: boolean;
  pdfRequired?: boolean;
  pdfLabelEn?: string;
  pdfLabelNp?: string;
  
  photo1Enabled?: boolean;
  photo1Required?: boolean;
  photo1LabelEn?: string;
  photo1LabelNp?: string;
  
  photo2Enabled?: boolean;
  photo2Required?: boolean;
  photo2LabelEn?: string;
  photo2LabelNp?: string;
  
  photo3Enabled?: boolean;
  photo3Required?: boolean;
  photo3LabelEn?: string;
  photo3LabelNp?: string;
  
  photo4Enabled?: boolean;
  photo4Required?: boolean;
  photo4LabelEn?: string;
  photo4LabelNp?: string;
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

  // Preview State
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [generatedRequestId, setGeneratedRequestId] = useState("");

  const handleOpenApplyModal = (service: ServiceItem) => {
    setSelectedService(service);
    setIsApplyModalOpen(true);
    setSubmitted(false);
    setIsPreviewMode(false);
    setGeneratedRequestId("");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, isPdf: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isPdf) {
        // Must be PDF only
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          alert(
            lang === "en"
              ? "Only PDF files are accepted for this document upload."
              : "यस कागजातको लागि केवल PDF फाइलहरू मात्र स्वीकार गरिन्छ।"
          );
          return;
        }
        // Strict limit of 100KB
        if (file.size > 100 * 1024) {
          alert(
            lang === "en"
              ? "PDF file size must be less than 100KB."
              : "PDF फाइलको आकार १००KB भन्दा कम हुनुपर्छ।"
          );
          return;
        }
      } else {
        // Image only - strictly JPG / JPEG
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension !== "jpg" && extension !== "jpeg") {
          alert(
            lang === "en"
              ? "Only JPG files are accepted for photo uploads."
              : "फोटो अपलोडको लागि केवल JPG फाइलहरू मात्र स्वीकार गरिन्छ।"
          );
          return;
        }
      }

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

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // 1. Basic Form Validations
    if (!name.trim()) {
      alert(lang === "en" ? "Full Name is required." : "पूरा नाम अनिवार्य छ।");
      return;
    }
    if (!province.trim() || !district.trim() || !localLevel.trim() || !ward.trim() || !tole.trim()) {
      alert(lang === "en" ? "All permanent address fields are compulsory." : "स्थायी ठेगानाका सबै क्षेत्रहरू अनिवार्य छन्।");
      return;
    }
    if (!contact.trim()) {
      alert(lang === "en" ? "Contact number is required." : "सम्पर्क नम्बर अनिवार्य छ।");
      return;
    }
    
    // Validate Nepali mobile number: must be exactly 10 digits starting with 9
    const contactCleaned = contact.trim();
    if (contactCleaned.length !== 10 || !contactCleaned.startsWith("9")) {
      alert(
        lang === "en"
          ? "Contact number must be exactly 10 digits starting with 9."
          : "सम्पर्क नम्बर ९ बाट सुरु हुने १० अंकको हुनुपर्दछ।"
      );
      return;
    }

    // Gmail validation
    const emailCleaned = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailCleaned)) {
      alert(
        lang === "en"
          ? "Please enter a valid Gmail address (must contain @ and end with gmail.com)."
          : "कृपया मान्य जिमेल (Gmail) ठेगाना राख्नुहोस् (@ र gmail.com अनिवार्य छ)।"
      );
      return;
    }

    // Check custom required attachments dynamically
    // A) PDF Document Check
    if (selectedService.pdfEnabled && selectedService.pdfRequired) {
      const pdfLabel = (lang === "en" ? selectedService.pdfLabelEn : selectedService.pdfLabelNp) || "PDF Document";
      const hasPdf = attachments.some(att => att.name === pdfLabel);
      if (!hasPdf) {
        alert(
          lang === "en"
            ? `Please upload the compulsory PDF document: ${pdfLabel}`
            : `कृपया अनिवार्य PDF कागजात अपलोड गर्नुहोस्: ${pdfLabel}`
        );
        return;
      }
    }

    // B) Photos 1-4 Checks
    for (let slot = 1; slot <= 4; slot++) {
      const isEnabled = (selectedService as any)[`photo${slot}Enabled`];
      const isRequired = (selectedService as any)[`photo${slot}Required`];
      const photoLabel = (lang === "en" ? (selectedService as any)[`photo${slot}LabelEn`] : (selectedService as any)[`photo${slot}LabelNp`]) || `Photo ${slot}`;

      if (isEnabled && isRequired) {
        const hasPhoto = attachments.some(att => att.name === photoLabel);
        if (!hasPhoto) {
          alert(
            lang === "en"
              ? `Please upload the compulsory photo: ${photoLabel}`
              : `कृपया अनिवार्य फोटो अपलोड गर्नुहोस्: ${photoLabel}`
          );
          return;
        }
      }
    }

    // C) Backward compatible fields checks (if modern config is not used, fall back to old legacy photo requirements list if present)
    if (!selectedService.photo1Enabled && !selectedService.photo2Enabled && !selectedService.photo3Enabled && !selectedService.photo4Enabled) {
      for (const reqPhoto of photoRequirements) {
        const hasPhoto = attachments.some(att => att.name === reqPhoto);
        if (!hasPhoto) {
          alert(
            lang === "en"
              ? `Please upload the compulsory photo: ${reqPhoto}`
              : `कृपया अनिवार्य फोटो अपलोड गर्नुहोस्: ${reqPhoto}`
          );
          return;
        }
      }
    }

    if (!selectedService.pdfEnabled) {
      for (const reqDoc of docRequirements) {
        const hasDoc = attachments.some(att => att.name === reqDoc);
        if (!hasDoc) {
          alert(
            lang === "en"
              ? `Please upload the compulsory PDF document: ${reqDoc}`
              : `कृपया अनिवार्य PDF कागजात अपलोड गर्नुहोस्: ${reqDoc}`
          );
          return;
        }
      }
    }

    // Dynamic custom questions check (compulsory)
    for (const question of customQuestions) {
      if (!customAnswers[question] || !customAnswers[question].trim()) {
        alert(
          lang === "en"
            ? `Please answer the custom question: ${question}`
            : `कृपया यस प्रश्नको जवाफ दिनुहोस्: ${question}`
        );
        return;
      }
    }

    // Passed validation! Generate dynamic unique request ID and enter Preview Mode
    const reqId = "REQ-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedRequestId(reqId);
    setIsPreviewMode(true);
  };

  const handleSubmit = async () => {
    if (!selectedService) return;
    setLoading(true);

    const emailCleaned = email.trim().toLowerCase();
    const contactCleaned = contact.trim();

    try {
      // 1. Fetch current applications list to check for duplicate request
      const snapshot = await get(ref(db, "service_applications"));
      if (snapshot.exists()) {
        const apps = Object.values(snapshot.val()) as any[];
        const isDuplicate = apps.some((app: any) => {
          if (app.serviceId !== selectedService.id) return false;
          
          // Check match on email
          const dbEmail = (app.email || "").trim().toLowerCase();
          const dbPhone = (app.contact || "").replace(/\s+/g, "").replace("+977", "").trim();
          
          const currentEmail = emailCleaned;
          const currentPhone = contactCleaned; // 10-digit
          
          return dbEmail === currentEmail || dbPhone === currentPhone;
        });

        if (isDuplicate) {
          alert(
            lang === "en"
              ? "Duplicate application detected! You have already submitted a request for this service. If you need to re-apply or make changes, please contact us using the 'Contact Me' or 'Suggestions' queries box."
              : "दुरुस्त प्रतिलिपि आवेदन भेटियो! तपाईंले पहिले नै यस सेवाको लागि आवेदन दिनुभएको छ। यदि तपाईंले फेरि आवेदन दिन वा परिवर्तन गर्नुपरेमा, कृपया 'सम्पर्क नम्बर' वा 'सुझावहरू' बक्स प्रयोग गरेर सम्पर्क गर्नुहोस्।"
          );
          setLoading(false);
          return;
        }
      }

      // 2. Submit to Realtime Database using the generated Request ID
      const appRef = ref(db, `service_applications/${generatedRequestId}`);
      await set(appRef, {
        id: generatedRequestId,
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
        contact: `+977 ${contactCleaned}`,
        email: emailCleaned,
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

  // Parsing legacy photo and doc requirements
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
                  {isPreviewMode 
                    ? (lang === "en" ? "Application Preview Receipt" : "आवेदन पूर्वावलोकन रसिद")
                    : (lang === "en" ? `Apply for: ${selectedService.titleEn}` : `आवेदन फारम: ${selectedService.titleNp}`)}
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
                    ? `Congratulations! Your request has been submitted successfully. Your Request ID is: ${generatedRequestId}. Please write this down or screenshot this page.`
                    : `बधाई छ! तपाईंको अनुरोध सफलतापूर्वक दर्ता भएको छ। तपाईंको अनुरोध आईडी (Request ID): ${generatedRequestId} हो। कृपया यो सुरक्षित राख्नुहोस् वा स्क्रिनसट लिनुहोस्।`}
                </p>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl max-w-xs mx-auto font-mono text-center">
                  <span className="text-gray-400 text-[10px] uppercase block mb-1">Request Unique ID</span>
                  <span className="text-lg font-bold text-cyan-400 tracking-wider">{generatedRequestId}</span>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    {lang === "en" ? "Close Portal" : "पोर्टल बन्द गर्नुहोस्"}
                  </button>
                </div>
              </div>
            ) : isPreviewMode ? (
              /* Receipt & Form Preview View Mode */
              <div className="space-y-6">
                
                {/* Visual Deletion Warning Notice */}
                <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs flex items-start space-x-2.5">
                  <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-bold text-amber-400 block mb-1">
                      {lang === "en" ? "Auto-Deletion Policy Notice:" : "स्वचालित-हटाउने नीति सूचना:"}
                    </span>
                    <p className="text-gray-300 leading-relaxed">
                      {lang === "en"
                        ? "Warning: For your privacy and data protection, all documents, photos, and personal details in this request will be automatically deleted in 2 days by the administrator."
                        : "चेतावनी: तपाईंको गोपनीयता र डाटा सुरक्षाको लागि, यस अनुरोधका सबै कागजातहरू, फोटोहरू, र व्यक्तिगत विवरणहरू २ दिनमा प्रशासकद्वारा स्वचालित रूपमा मेटिनेछन्।"}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-[#0c1222] border border-white/10 rounded-2xl space-y-6 font-sans relative overflow-hidden print:bg-white print:text-black">
                  <div className="absolute top-0 right-0 p-3 bg-cyan-500/10 text-cyan-400 border-l border-b border-white/10 rounded-bl-xl font-mono text-xs font-bold tracking-widest">
                    {generatedRequestId}
                  </div>

                  <div className="border-b border-white/10 pb-4">
                    <h4 className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {lang === "en" ? "Application Invoice Receipt" : "आवेदन रसिद पूर्वावलोकन"}
                    </h4>
                    <span className="text-xs text-gray-400 block mt-1">
                      {lang === "en" ? "Service Applied:" : "लागू गरिएको सेवा:"} <strong className="text-white">{lang === "en" ? selectedService.titleEn : selectedService.titleNp}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-400 block">{lang === "en" ? "Applicant Full Name:" : "आवेदकको पूरा नाम:"}</span>
                      <strong className="text-white text-sm">{name}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block">{lang === "en" ? "Contact Number:" : "सम्पर्क नम्बर:"}</span>
                      <strong className="text-white text-sm font-mono">+977 {contact}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block">{lang === "en" ? "Gmail Address:" : "जिमेल ठेगाना:"}</span>
                      <strong className="text-white text-sm font-mono">{email}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block">{lang === "en" ? "Preferred Contact Method:" : "सम्पर्क विधि:"}</span>
                      <strong className="text-white text-sm">{contactMethod}</strong>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-gray-400 block">{lang === "en" ? "Permanent Address:" : "स्थायी ठेगाना:"}</span>
                      <strong className="text-white">
                        {province}, {district}, {localLevel}, Ward {ward}, {tole}
                      </strong>
                    </div>
                    {temporaryAddress && (
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-gray-400 block">{lang === "en" ? "Temporary Address:" : "अस्थायी ठेगाना:"}</span>
                        <strong className="text-white">{temporaryAddress}</strong>
                      </div>
                    )}
                  </div>

                  {/* Custom Questions Answers Preview */}
                  {customQuestions.length > 0 && (
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <span className="text-xs font-bold font-mono text-purple-400 block uppercase">
                        {lang === "en" ? "Form Questionnaire Responses" : "प्रश्नावली प्रतिक्रियाहरू"}
                      </span>
                      <div className="space-y-2.5">
                        {customQuestions.map((q, idx) => (
                          <div key={idx} className="bg-white/[0.01] p-2.5 rounded-lg border border-white/5 text-xs">
                            <span className="text-gray-400 block mb-1 font-semibold">{q}</span>
                            <p className="text-white">{customAnswers[q] || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Attachments Count */}
                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <span className="text-xs font-bold font-mono text-cyan-400 block uppercase">
                      {lang === "en" ? "Uploaded Files Proofs" : "अपलोड गरिएका फाइलहरूको प्रमाण"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl border border-white/10">
                          <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <div className="truncate">
                            <span className="text-gray-400 text-[9px] block uppercase leading-none">{att.name}</span>
                            <span className="text-white font-mono text-[10px] truncate block">{att.fileName}</span>
                          </div>
                        </div>
                      ))}
                      {attachments.length === 0 && (
                        <span className="text-gray-500 italic text-xs">{lang === "en" ? "No attachments uploaded" : "कुनै कागजातहरू अपलोड गरिएको छैन"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(false)}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase text-gray-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{lang === "en" ? "Go Back & Edit" : "फर्कनुहोस् र सम्पादन गर्नुहोस्"}</span>
                  </button>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#1e1b4b] border border-purple-500/20 text-xs font-bold uppercase text-purple-300 hover:bg-purple-950 transition-colors w-full sm:w-auto cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      <span>{lang === "en" ? "Print Receipt" : "रसिद प्रिन्ट गर्नुहोस्"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 bg-cyan-500 text-black hover:bg-cyan-400 font-bold uppercase text-xs tracking-wider rounded-xl transition-all disabled:opacity-50 active:scale-95 w-full sm:w-auto cursor-pointer"
                    >
                      <span>
                        {loading 
                          ? (lang === "en" ? "Submitting..." : "दर्ता गर्दै...") 
                          : (lang === "en" ? "Confirm & Submit" : "निश्चित गरी बुझाउनुहोस्")}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <form onSubmit={handlePreview} className="space-y-6">
                
                {/* CMS Special Notice / Auto deletion warning */}
                <div className="space-y-2">
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

                  <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-[11px] text-gray-300">
                    <strong className="text-cyan-400 font-mono uppercase block mb-0.5">{lang === "en" ? "Privacy & Automatic Deletion warning" : "गोपनीयता र स्वचालित हटाउने चेतावनी"}</strong>
                    {lang === "en" 
                      ? "Before pressing the submit button, please note that all details and documents submitted here will be automatically deleted in 2 days by the administrator for data minimization."
                      : "कृपया बुझाउनु अघि ध्यान दिनुहोस् कि यहाँ पेश गरिएका सबै विवरण र कागजातहरू २ दिन भित्र प्रशासकद्वारा स्वचालित रूपमा मेटिनेछन्।"}
                  </div>
                </div>

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
                        <span>{lang === "en" ? "Nepali Mobile Number *" : "नेपाली मोबाइल नम्बर *"}</span>
                        <span className="ml-1 text-cyan-400 font-mono font-normal">({lang === "en" ? "Exactly 10 digits starting with 9" : "ठीक १० अंक, ९ बाट सुरु"})</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-xs text-gray-400 font-mono font-bold select-none">
                          +977
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={contact}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setContact(val);
                          }}
                          placeholder="9XXXXXXXXX"
                          className="w-full bg-white/5 border border-white/10 rounded-r-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-400 block flex items-center">
                        <span>{lang === "en" ? "Gmail Address *" : "जिमेल ठेगाना *"}</span>
                        <span className="ml-1 text-purple-400 font-mono font-normal">({lang === "en" ? "gmail.com contains @ and ." : "gmail.com, @ र . अनिवार्य"})</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@gmail.com"
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
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-white/5 pb-1 flex items-center space-x-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{lang === "en" ? "5. Document Uploads *" : "५. आवश्यक कागजातहरू *"}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Modern CMS configurations checks first */}
                    {selectedService.pdfEnabled ? (
                      /* Modern CMS PDF Slot */
                      (() => {
                        const label = (lang === "en" ? selectedService.pdfLabelEn : selectedService.pdfLabelNp) || "PDF Document";
                        const isRequired = selectedService.pdfRequired || false;
                        const fileSelected = attachments.find(att => att.name === label);
                        return (
                          <div className="p-3 bg-cyan-950/10 border border-cyan-500/20 rounded-xl space-y-2 col-span-1 sm:col-span-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase truncate">
                                {label} {isRequired && <span className="text-red-400">*</span>}
                              </span>
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">PDF ONLY (Max 100KB)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 transition-colors">
                                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                                <span>{fileSelected ? (lang === "en" ? "Change PDF" : "PDF परिवर्तन") : (lang === "en" ? "Upload PDF" : "PDF अपलोड")}</span>
                                <input
                                  type="file"
                                  required={isRequired && !fileSelected}
                                  accept=".pdf"
                                  onChange={(e) => handleFileChange(e, label, true)}
                                  className="hidden"
                                />
                              </label>
                              {fileSelected && (
                                <span className="text-[9px] font-mono text-cyan-400 truncate max-w-[200px]" title={fileSelected.fileName}>
                                  ✓ {fileSelected.fileName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* Legacy Doc/PDF Upload triggers */
                      docRequirements.map((docField, index) => {
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
                                  accept=".pdf"
                                  onChange={(e) => handleFileChange(e, docField, true)}
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
                      })
                    )}

                    {/* Modern CMS Photo Slots 1-4 */}
                    {[1, 2, 3, 4].some(slot => (selectedService as any)[`photo${slot}Enabled`]) ? (
                      /* Render enabled slots of 1 to 4 */
                      [1, 2, 3, 4].map(slot => {
                        const isEnabled = (selectedService as any)[`photo${slot}Enabled`] || false;
                        if (!isEnabled) return null;

                        const isRequired = (selectedService as any)[`photo${slot}Required`] || false;
                        const label = (lang === "en" ? (selectedService as any)[`photo${slot}LabelEn`] : (selectedService as any)[`photo${slot}LabelNp`]) || `Photo Slot ${slot}`;
                        const fileSelected = attachments.find(att => att.name === label);

                        return (
                          <div key={`photo-slot-${slot}`} className="p-3 bg-purple-950/10 border border-purple-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-purple-400 block uppercase truncate">
                                {label} {isRequired && <span className="text-red-400">*</span>}
                              </span>
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">JPG ONLY</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 transition-colors">
                                <Upload className="h-3.5 w-3.5 text-purple-400" />
                                <span>{fileSelected ? (lang === "en" ? "Change JPG" : "परिवर्तन") : (lang === "en" ? "Upload JPG" : "अपलोड")}</span>
                                <input
                                  type="file"
                                  required={isRequired && !fileSelected}
                                  accept=".jpg,.jpeg"
                                  onChange={(e) => handleFileChange(e, label, false)}
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
                      })
                    ) : (
                      /* Legacy Photo Upload triggers */
                      photoRequirements.map((photoField, index) => {
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
                                  accept=".jpg,.jpeg"
                                  onChange={(e) => handleFileChange(e, photoField, false)}
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
                      })
                    )}

                  </div>
                </div>

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
                            {question} *
                          </label>
                          <textarea
                            rows={2}
                            required
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
                    className="px-6 py-2 bg-cyan-500 text-black hover:bg-cyan-400 font-bold uppercase text-xs tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>
                      {lang === "en" ? "Preview Application" : "आवेदन पूर्वावलोकन गर्नुहोस्"}
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
