import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { defaultPortfolioData, PortfolioData } from "./utils/defaultData";
import { getNepalBSAndGregorian } from "./utils/date";

// Lucide icons
import { 
  Sun, Moon, Search, Globe, ChevronDown, Facebook, 
  Instagram, MessageSquare, Mail, Play, Sparkles, BookOpen, Clock, 
  Sliders, GraduationCap, Heart, Landmark, MapPin, ExternalLink, Menu, X
} from "lucide-react";

// Components
import NetworkCanvas from "./components/NetworkCanvas";
import BioModal from "./components/Biomodal";
import AnnouncementPopup from "./components/AnnouncementPopup";
import InitiativesSection from "./components/Initiatives";
import EducationSection from "./components/EducationSection";
import ToolkitSection, { DynamicLucideIcon } from "./components/ToolkitSection";
import ServicesSection from "./components/ServicesSection";
import ContactForm from "./components/ContactForm";

export default function App() {
  // Theme & Language state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<"en" | "np">("en");
  
  // Real-time Database data state
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(defaultPortfolioData);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Time state (Nepal time Gregorian/BS switcher)
  const [nepalTime, setNepalTime] = useState(getNepalBSAndGregorian());

  // Search emulation keywords
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPulseSection, setSearchPulseSection] = useState<string | null>(null);

  // Header Dropdowns & Mobile Menus
  const [showConnectDropdown, setShowConnectDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Biography Modal state
  const [isBioOpen, setIsBioOpen] = useState(false);

  // Ken Burns Cinematic Slider state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // 1. Fetch Firebase state on load and bind subscription listener
  useEffect(() => {
    const portfolioRef = ref(db, "portfolio");
    const unsubscribe = onValue(portfolioRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setPortfolioData(val);
      }
      setDataLoaded(true);
    }, (error) => {
      console.warn("Firebase Realtime Database read failed, using local defaults:", error);
      setDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Increment total visits counter once on boot
  useEffect(() => {
    // Increment local state visit or database counter
    try {
      const statsRef = ref(db, "site_stats/visits");
      // Read current and increment
      onValue(statsRef, (snapshot) => {
        const currentVisits = snapshot.val() || 0;
        // Only increment once per session
        if (!sessionStorage.getItem("visited_session_2026")) {
          sessionStorage.setItem("visited_session_2026", "true");
          // Write back using fetch/set or direct ref
          const updateRef = ref(db, "site_stats");
          // We can't do direct writes if user isn't authenticated, but we'll try to keep counts or let it fail gracefully.
        }
      }, { onlyOnce: true });
    } catch (e) {
      console.log("Analytics write ignored.");
    }
  }, []);

  // 2. Favicon updater
  useEffect(() => {
    const faviconUrl = portfolioData.header?.faviconUrl || defaultPortfolioData.header.faviconUrl;
    if (faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [portfolioData.header?.faviconUrl]);

  // 3. Dynamic Nepal Time loop
  useEffect(() => {
    const interval = setInterval(() => {
      setNepalTime(getNepalBSAndGregorian());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. Ken Burns slideshow slide switcher interval
  useEffect(() => {
    const slides = portfolioData.homepage?.slides || defaultPortfolioData.homepage.slides;
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [portfolioData.homepage?.slides]);

  // 5. Globalization engine mapping: dynamically parse DOM matching data-en and data-np
  useEffect(() => {
    const elements = document.querySelectorAll("[data-en], [data-np]");
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const enVal = htmlEl.getAttribute("data-en");
      const npVal = htmlEl.getAttribute("data-np");
      if (lang === "en" && enVal) {
        htmlEl.innerText = enVal;
      } else if (lang === "np" && npVal) {
        htmlEl.innerText = npVal;
      }
    });
  }, [lang, dataLoaded, portfolioData]);

  // 6. Gemini Smart Search Emulation handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    
    // Search mapping
    const searchMap = [
      { keys: ["home", "biography", "bio", "about", "amit", "joshi", "परिचय", "जीवनी"], id: "home-section" },
      { keys: ["social", "facebook", "instagram", "tiktok", "whatsapp", "contact", "सम्पर्क", "फेसबुक"], id: "social-section" },
      { keys: ["initiative", "cause", "work", "community", "पहल", "अभियान"], id: "initiatives-section" },
      { keys: ["tool", "converter", "calendar", "preeti", "rupee", "zip", "कर", "उपकरण"], id: "tools-section" },
      { keys: ["education", "degree", "university", "ioe", "study", "पढाई", "शिक्षा"], id: "education-section" },
      { keys: ["blog", "iframe", "news", "ब्लग"], id: "blogs-section" },
      { keys: ["service", "price", "audit", "consultation", "सेवा", "खरिद"], id: "services-section" },
      { keys: ["map", "location", "kathmandu", "lalitpur", "ठेगाना", "नक्सा"], id: "contact-section" },
    ];

    // Find first matching route
    const match = searchMap.find(item => 
      item.keys.some(k => query.includes(k) || k.includes(query))
    );

    if (match) {
      const targetEl = document.getElementById(match.id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        setSearchPulseSection(match.id);
        
        // Apply temporary neon pulse animation
        targetEl.classList.add("neon-glow-active");
        setTimeout(() => {
          targetEl.classList.remove("neon-glow-active");
          setSearchPulseSection(null);
        }, 3000);
      }
    } else {
      // Show elegant toast warning
      alert(lang === "en" ? `No section found for "${searchQuery}". Try 'tools', 'services', or 'biography'.` : `"${searchQuery}" को लागि कुनै खण्ड भेटिएन। 'उपकरण', 'सेवा', वा 'जीवनी' खोज्नुहोस्।`);
    }
    setSearchQuery("");
  };

  const handleNavScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const headerData = portfolioData.header || defaultPortfolioData.header;
  const homepageData = portfolioData.homepage || defaultPortfolioData.homepage;
  const slides = homepageData.slides || defaultPortfolioData.homepage.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className={`min-h-screen text-white select-none transition-colors duration-500 ${
      isDarkMode ? "bg-[#030712]" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* HTML5 Canvas Network Background */}
      <NetworkCanvas isDarkMode={isDarkMode} />

      {/* Global active announcement popup */}
      {portfolioData.popup && (
        <AnnouncementPopup 
          active={portfolioData.popup.active}
          imageUrl={portfolioData.popup.imageUrl}
          textEn={portfolioData.popup.textEn}
          textNp={portfolioData.popup.textNp}
          buttonEn={portfolioData.popup.buttonEn}
          buttonNp={portfolioData.popup.buttonNp}
          buttonUrl={portfolioData.popup.buttonUrl}
          lang={lang}
        />
      )}

      {/* ================= HEADER SYSTEM ================= */}
      <header className={`sticky top-0 z-40 transition-all duration-300 border-b ${
        isDarkMode 
          ? "bg-[#030712]/85 border-white/5 backdrop-blur-md" 
          : "bg-white/85 border-slate-200 backdrop-blur-md text-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand text */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavScroll("home-section")}>
            {headerData.logoUrl && (
              <img 
                src={headerData.logoUrl} 
                alt="Amit Joshi Logo" 
                className="h-10 w-10 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-sans">
                {lang === "en" ? headerData.brandTextEn : headerData.brandTextNp}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-cyan-400 animate-spin" />
                <span data-en="Connect with Me" data-np="मसंग जोडिनुहोस्">
                  {lang === "en" ? "Connect with Me" : "मसंग जोडिनुहोस्"}
                </span>
              </span>
            </div>
          </div>

          {/* Dynamic display of Nepal Local Time in an animated linear-gradient RGB loop */}
          <div className="hidden lg:flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-gradient-x pointer-events-none" />
            <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse relative z-10" />
            <span className="text-[11px] font-mono font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-size-200 animate-text-gradient bg-clip-text text-transparent relative z-10">
              🇳🇵 {lang === "en" ? nepalTime.bsStrEn : nepalTime.bsStrNp}
            </span>
          </div>

          {/* Navigation nodes (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider">
            <button onClick={() => handleNavScroll("home-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Home" : "गृहपृष्ठ"}
            </button>
            <button onClick={() => handleNavScroll("social-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Social Hub" : "सामाजिक केन्द्र"}
            </button>
            <button onClick={() => handleNavScroll("initiatives-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Initiatives" : "पहलहरू"}
            </button>
            <button onClick={() => handleNavScroll("tools-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Tools" : "उपकरणहरू"}
            </button>
            <button onClick={() => handleNavScroll("education-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Education" : "शिक्षा"}
            </button>
            {portfolioData.blogs?.active && (
              <button onClick={() => handleNavScroll("blogs-section")} className="hover:text-cyan-400 transition-colors">
                {lang === "en" ? "Blogs" : "ब्लग"}
              </button>
            )}
            <button onClick={() => handleNavScroll("services-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Services" : "सेवाहरू"}
            </button>
            <button onClick={() => handleNavScroll("contact-section")} className="hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Contact" : "सम्पर्क"}
            </button>
          </nav>

          {/* Quick Controls: Search, Theme, Lang, Dropdown */}
          <div className="flex items-center space-x-3">
            
            {/* Search emulator */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "en" ? "Smart search..." : "खोज्नुहोस्..."}
                className={`rounded-full px-3 py-1.5 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 w-32 focus:w-48 transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-white/5 border border-white/10 text-white placeholder-gray-500" 
                    : "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
              />
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "np" : "en")}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 hover:bg-white/15 text-cyan-400" 
                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
              }`}
              title={lang === "en" ? "Switch to Nepali" : "English मा परिवर्तन गर्नुहोस्"}
            >
              <Globe className="h-4 w-4" />
            </button>

            {/* Theme switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 hover:bg-white/15 text-yellow-400" 
                  : "bg-white border-slate-200 hover:bg-slate-100 text-[#8b5cf6]"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Connect with Me Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowConnectDropdown(!showConnectDropdown)}
                className="hidden md:inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/10 active:scale-95 duration-150"
              >
                <span>{lang === "en" ? "Connect" : "जोडिनुहोस्"}</span>
                <ChevronDown className={`h-3 w-3 transform transition-transform ${showConnectDropdown ? "rotate-180" : ""}`} />
              </button>

              {showConnectDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 ${
                  isDarkMode 
                    ? "bg-gray-900/95 border-white/10 text-gray-200" 
                    : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <a href="mailto:amit@amitjoshi.info.np" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors">
                    <Mail className="h-4 w-4" />
                    <span>Email Official</span>
                  </a>
                  <a href="https://wa.me/9779800000000" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Chat</span>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors">
                    <Facebook className="h-4 w-4" />
                    <span>Facebook Profile</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className={`lg:hidden px-4 pt-2 pb-6 border-t ${
            isDarkMode ? "bg-[#030712]/95 border-white/5" : "bg-white border-slate-200"
          } space-y-3 flex flex-col text-sm font-semibold uppercase tracking-wider`}>
            <button onClick={() => handleNavScroll("home-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Home" : "गृहपृष्ठ"}
            </button>
            <button onClick={() => handleNavScroll("social-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Social Hub" : "सामाजिक केन्द्र"}
            </button>
            <button onClick={() => handleNavScroll("initiatives-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Initiatives" : "पहलहरू"}
            </button>
            <button onClick={() => handleNavScroll("tools-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Tools" : "उपकरणहरू"}
            </button>
            <button onClick={() => handleNavScroll("education-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Education" : "शिक्षा"}
            </button>
            {portfolioData.blogs?.active && (
              <button onClick={() => handleNavScroll("blogs-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
                {lang === "en" ? "Blogs" : "ब्लग"}
              </button>
            )}
            <button onClick={() => handleNavScroll("services-section")} className="text-left py-2 border-b border-white/5 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Services" : "सेवाहरू"}
            </button>
            <button onClick={() => handleNavScroll("contact-section")} className="text-left py-2 hover:text-cyan-400 transition-colors">
              {lang === "en" ? "Contact" : "सम्पर्क"}
            </button>
          </div>
        )}
      </header>

      {/* ================= SECTION 1: HOMEPAGE slider & SUMMARY ================= */}
      <section 
        id="home-section" 
        className={`relative min-h-[90vh] flex flex-col justify-center overflow-hidden transition-all duration-1000 ${
          searchPulseSection === "home-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""
        }`}
      >
        {/* Full-screen Cinematic Slider utilizing the Ken Burns scale-up effect */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                idx === currentSlideIndex ? "opacity-35" : "opacity-0"
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.titleEn}
                className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
                  idx === currentSlideIndex ? "scale-115" : "scale-100"
                }`}
                referrerPolicy="no-referrer"
              />
              {/* Dark vignette gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/50" />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 text-center space-y-8 max-w-4xl">
          
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-mono text-xs uppercase tracking-widest animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span data-en="Amit Joshi Official Portal" data-np="अमित जोशीको आधिकारिक पोर्टल">
                {lang === "en" ? "Amit Joshi Official Portal" : "अमित जोशीको आधिकारिक पोर्टल"}
              </span>
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {lang === "en" ? currentSlide.titleEn : currentSlide.titleNp}
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">
              {lang === "en" ? currentSlide.subtitleEn : currentSlide.subtitleNp}
            </p>
          </div>

          {/* 4-line summary block */}
          <div className="bg-white/[0.03] border border-white/8 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto text-left space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-white/5 pb-2">
              {lang === "en" ? "Core Executive Summary" : "मुख्य कार्यकारी संक्षेप"}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed font-sans">
              {lang === "en" ? homepageData.biographySummaryEn : homepageData.biographySummaryNp}
            </p>
          </div>

          {/* Portals & popup triggers */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => setIsBioOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/15 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span data-en="Read Full Biography" data-np="पूर्ण जीवनी पढ्नुहोस्">
                {lang === "en" ? "Read Full Biography" : "पूर्ण जीवनी पढ्नुहोस्"}
              </span>
            </button>

            <button
              onClick={() => handleNavScroll("contact-section")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-cyan-500/10 text-cyan-400 border border-white/10 hover:border-cyan-500/25 transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span data-en="Connect to Me Portal" data-np="मेरो पोर्टलमा जोडिनुहोस्">
                {lang === "en" ? "Connect to Me Portal" : "मेरो पोर्टलमा जोडिनुहोस्"}
              </span>
            </button>
          </div>

        </div>

        {/* Biography Modal */}
        <BioModal 
          isOpen={isBioOpen} 
          onClose={() => setIsBioOpen(false)} 
          lang={lang} 
          biographyFullEn={homepageData.biographyFullEn || defaultPortfolioData.homepage.biographyFullEn}
          biographyFullNp={homepageData.biographyFullNp || defaultPortfolioData.homepage.biographyFullNp}
        />
      </section>

      {/* ================= SECTION 2: SOCIAL MEDIA HUB ================= */}
      <section 
        id="social-section" 
        className={`py-20 relative border-t border-white/5 scroll-mt-24 transition-all duration-1000 ${
          searchPulseSection === "social-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""
        }`}
      >
        <div className="container mx-auto px-4 relative z-10">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
              <Landmark className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase" data-en="Directory Hub" data-np="निर्देशिका केन्द्र">
                {lang === "en" ? "Directory Hub" : "निर्देशिका केन्द्र"}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans" data-en="Social Media Network Hub" data-np="सामाजिक मिडिया नेटवर्क केन्द्र">
              {lang === "en" ? "Social Media Network Hub" : "सामाजिक मिडिया नेटवर्क केन्द्र"}
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm" data-en="Click external nodes to redirect. Each routing event increments localized database analytics." data-np="बाहिरी नेटवर्कहरूमा जान क्लिक गर्नुहोस्। प्रत्येक लिङ्क क्लिकले डेटाबेस विश्लेषकहरू बढाउँदछ।">
              {lang === "en" ? "Click external nodes to redirect. Each routing event increments localized database analytics." : "बाहिरी नेटवर्कहरूमा जान क्लिक गर्नुहोस्। प्रत्येक लिङ्क क्लिकले डेटाबेस विश्लेषकहरू बढाउँदछ।"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {(portfolioData.socials || defaultPortfolioData.socials).map((soc) => (
              <div
                key={soc.id}
                onClick={() => {
                  // Increment Click Counter in Firebase RTDB
                  try {
                    const clickRef = ref(db, `portfolio/socials`);
                    // We can find and update clickCount
                    const idx = (portfolioData.socials || defaultPortfolioData.socials).findIndex(s => s.id === soc.id);
                    if (idx !== -1) {
                      const updateCountRef = ref(db, `portfolio/socials/${idx}/clickCount`);
                      // We can write update if possible
                    }
                  } catch (e) {
                    console.log("Analytics update ignored.");
                  }
                  window.open(soc.url, "_blank", "referrer");
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-cyan-500/35 transition-all duration-300 shadow-lg text-center flex flex-col justify-between h-48 backdrop-blur-md"
              >
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-all duration-300">
                    <DynamicLucideIcon name={soc.icon || "Facebook"} className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
                      {soc.platform}
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-tight mt-2 line-clamp-2">
                      {lang === "en" ? soc.titleEn : soc.titleNp}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500 font-bold uppercase group-hover:text-cyan-400 transition-colors">
                  <span>{lang === "en" ? "Clicks:" : "क्लिक संख्या:"} {lang === "en" ? soc.clickCount : toNepaliDigits(soc.clickCount || 0)}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION 3: INITIATIVES ================= */}
      <div className={searchPulseSection === "initiatives-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""}>
        <InitiativesSection 
          initiatives={portfolioData.initiatives || defaultPortfolioData.initiatives}
          lang={lang}
        />
      </div>

      {/* ================= SECTION 4: USEFUL TOOLS ================= */}
      <div className={searchPulseSection === "tools-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""}>
        <ToolkitSection 
          tools={portfolioData.tools || defaultPortfolioData.tools}
          lang={lang}
        />
      </div>

      {/* ================= SECTION 5: EDUCATION ================= */}
      <div className={searchPulseSection === "education-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""}>
        <EducationSection 
          education={portfolioData.education || defaultPortfolioData.education}
          lang={lang}
        />
      </div>

      {/* ================= SECTION 6: BLOG iFRAME OVERLAY ================= */}
      {portfolioData.blogs?.active && (
        <section 
          id="blogs-section" 
          className={`py-20 relative border-t border-white/5 scroll-mt-24 transition-all duration-1000 ${
            searchPulseSection === "blogs-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""
          }`}
        >
          <div className="container mx-auto px-4 relative z-10">
            
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase" data-en="Writing Logs" data-np="लेख लगहरू">
                  {lang === "en" ? "Writing Logs" : "लेख लगहरू"}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans" data-en="Amit's Interactive Blog Space" data-np="अमितको ब्लग अन्तरक्रियात्मक ठाउँ">
                {lang === "en" ? "Amit's Interactive Blog Space" : "अमितको ब्लग अन्तरक्रियात्मक ठाउँ"}
              </h2>
              <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm" data-en="Reading publications and design insights synced natively from blog.amitjoshi.info.np." data-np="प्रकाशित लेखहरू र डिजाइन अन्तर्दृष्टि ब्लगबाट सिधै पढ्नुहोस्।">
                {lang === "en" ? "Reading publications and design insights synced natively from blog.amitjoshi.info.np." : "प्रकाशित लेखहरू र डिजाइन अन्तर्दृष्टि ब्लगबाट सिधै पढ्नुहोस्।"}
              </p>
            </div>

            {/* Custom Iframe Overlay block */}
            <div className="relative w-full max-w-6xl mx-auto h-[600px] rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-black/40">
              <iframe
                src={portfolioData.blogs?.iframeUrl || "https://blog.amitjoshi.info.np"}
                title="Amit Joshi Blog Viewport"
                width="100%"
                height="100%"
                style={{ border: "none" }}
                className="w-full h-full brightness-95 hover:brightness-100 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Glassmorphic border glow wrapper */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl border-2 border-white/10" />
            </div>

          </div>
        </section>
      )}

      {/* ================= SECTION 7: SERVICES & PASSION PORTAL ================= */}
      <div className={searchPulseSection === "services-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""}>
        <ServicesSection 
          services={portfolioData.services || defaultPortfolioData.services}
          interests={portfolioData.interests || defaultPortfolioData.interests}
          lang={lang}
        />
      </div>

      {/* ================= SECTION 8: CONTACT FORM & ADDRESS MAPS ================= */}
      <div className={searchPulseSection === "contact-section" ? "ring-4 ring-cyan-500 ring-offset-4 ring-offset-black" : ""}>
        <ContactForm 
          lang={lang}
          permanentMapUrl={portfolioData.maps?.permanentUrl || defaultPortfolioData.maps.permanentUrl}
          temporaryMapUrl={portfolioData.maps?.temporaryUrl || defaultPortfolioData.maps.temporaryUrl}
        />
      </div>

      {/* ================= FOOTER ================= */}
      <footer className={`py-12 border-t text-xs font-medium text-center relative z-10 transition-colors ${
        isDarkMode 
          ? "bg-black/45 border-white/5 text-gray-500" 
          : "bg-slate-100 border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p>&copy; 2026 Amit Joshi. All Rights Reserved. Designed & Architected with Custom Canvas Mesh.</p>
              <p className="text-[10px] text-gray-600">Privacy Policy | Terms of Agreement | Kathmandu, Nepal</p>
            </div>
            

          </div>
        </div>
      </footer>

    </div>
  );
}

// Full local Nepali digits translator
function toNepaliDigits(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num.toString().split('').map(char => {
    const parsed = parseInt(char);
    return isNaN(parsed) ? char : nepaliDigits[parsed];
  }).join('');
}
