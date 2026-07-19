import React, { useState } from "react";
import { MessageSquare, MapPin, Send, PhoneCall } from "lucide-react";

interface ContactFormProps {
  lang: "en" | "np";
  permanentMapUrl: string;
  temporaryMapUrl: string;
}

export default function ContactForm({ lang, permanentMapUrl, temporaryMapUrl }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert(lang === "en" ? "Please fill in your name and message." : "कृपया आफ्नो नाम र सन्देश भर्नुहोस्।");
      return;
    }

    setLoading(true);

    // Formulate the formatted encoded query string
    const whatsappMsg = `*-- New Portfolio Suggestion (2026) --*\n\n` +
      `👤 *Name:* ${formData.name}\n` +
      `🏠 *Address:* ${formData.address || "Not Provided"}\n` +
      `📞 *Contact:* ${formData.contact || "Not Provided"}\n\n` +
      `💬 *Message/Suggestion:*\n${formData.message}`;

    const phone = "9779800000000"; // Amit's pre-configured official number
    const encodedText = encodeURIComponent(whatsappMsg);
    const url = `https://wa.me/${phone}?text=${encodedText}`;

    // Open WhatsApp redirect in a new tab
    window.open(url, "_blank", "referrer");

    // Reset Form
    setFormData({
      name: "",
      address: "",
      contact: "",
      message: "",
    });
    setLoading(false);
  };

  return (
    <section id="contact-section" className="py-20 relative border-t border-white/5 scroll-mt-24">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <span 
              className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase"
              data-en="Contact Gateway"
              data-np="सम्पर्क केन्द्र"
            >
              {lang === "en" ? "Contact Gateway" : "सम्पर्क केन्द्र"}
            </span>
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans"
            data-en="Suggestion Box & Location Maps"
            data-np="सुझाव पेटिका र स्थान नक्सा"
          >
            {lang === "en" ? "Suggestion Box & Location Maps" : "सुझाव पेटिका र स्थान नक्सा"}
          </h2>
          <p 
            className="text-gray-400 mt-3 max-w-xl mx-auto text-sm"
            data-en="Drop critical suggestions directly into Amit's official WhatsApp inbox or inspect physical address nodes."
            data-np="अमितको आधिकारिक व्हाट्सएप इनबक्समा सिधै महत्त्वपूर्ण सुझावहरू पठाउनुहोस् वा भौतिक ठेगानाहरू निरीक्षण गर्नुहोस्।"
          >
            {lang === "en" ? "Drop critical suggestions directly into Amit's official WhatsApp inbox or inspect physical address nodes." : "अमितको आधिकारिक व्हाट्सएप इनबक्समा सिधै महत्त्वपूर्ण सुझावहरू पठाउनुहोस् वा भौतिक ठेगानाहरू निरीक्षण गर्नुहोस्।"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start">
          
          {/* LEFT COLUMN: Suggestion Box Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl">
            <h3 
              className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center space-x-2 font-sans"
              data-en="Send Suggestion / Query"
              data-np="सुझाव वा सोधपुछ पठाउनुहोस्"
            >
              <Send className="h-4 w-4 text-cyan-400" />
              <span>{lang === "en" ? "Send Suggestion / Query" : "सुझाव वा सोधपुछ पठाउनुहोस्"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-gray-400 block">
                  {lang === "en" ? "Full Name *" : "पूरा नाम *"}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={lang === "en" ? "Amit Sharma" : "अमित शर्मा"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Address field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-gray-400 block">
                  {lang === "en" ? "Address" : "ठेगाना"}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={lang === "en" ? "Koteshwor, Kathmandu" : "कोटेश्वर, काठमाडौं"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Contact/Phone field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-gray-400 block">
                  {lang === "en" ? "Contact Number / Email" : "सम्पर्क नम्बर / इमेल"}
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder={lang === "en" ? "+977 98XXXXXXX or email" : "+९७७ ९८XXXXXXX वा इमेल"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Message field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-gray-400 block">
                  {lang === "en" ? "Message Payload *" : "मुख्य सन्देश *"}
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={lang === "en" ? "Type details or consultation queries..." : "विवरण वा परामर्श सोधपुछ टाइप गर्नुहोस्..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10 active:scale-95 duration-150"
              >
                <MessageSquare className="h-4 w-4" />
                <span data-en="Send via WhatsApp Direct" data-np="व्हाट्सएप मार्फत पठाउनुहोस्">
                  {lang === "en" ? "Send via WhatsApp Direct" : "व्हाट्सएप मार्फत पठाउनुहोस्"}
                </span>
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Responsive Location Map Viewers (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Current address map (Temporary / Work) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg space-y-3">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2 text-white">
                <MapPin className="h-4 w-4 text-purple-400" />
                <h4 className="text-sm font-bold font-sans">
                  {lang === "en" ? "Current Address: Lalitpur, Nepal" : "हालको ठेगाना: ललितपुर, नेपाल"}
                </h4>
              </div>
              <div className="h-[210px] w-full rounded-xl border border-white/5 overflow-hidden shadow-inner relative bg-black/40">
                {temporaryMapUrl ? (
                  <iframe
                    src={temporaryMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    title="Current Address Map"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-mono text-gray-500">
                    Map Not Available
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/10" />
              </div>
            </div>

            {/* Permanent address map */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg space-y-3">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2 text-white">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <h4 className="text-sm font-bold font-sans">
                  {lang === "en" ? "Permanent Address: Kathmandu, Nepal" : "स्थायी ठेगाना: काठमाडौं, नेपाल"}
                </h4>
              </div>
              <div className="h-[210px] w-full rounded-xl border border-white/5 overflow-hidden shadow-inner relative bg-black/40">
                {permanentMapUrl ? (
                  <iframe
                    src={permanentMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    title="Permanent Address Map"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-mono text-gray-500">
                    Map Not Available
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/10" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
