import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const storedLng = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
const browserLng = typeof navigator !== 'undefined' ? navigator.language : 'de';
const initialLng = storedLng || (browserLng && browserLng.startsWith('de') ? 'de' : 'en');

// English translations
const en = {
  nav: {
    services: "Services",
    howItWorks: "How It Works",
    pricing: "Pricing",
    testimonials: "Testimonials",
    faq: "FAQ",
    contact: "Contact Us",
    getStarted: "Get Started",
    bookMeeting: "Book a Meeting"
  },
  toolsIntegration: {
    title: "Works With Your Existing Tools",
    subtitle: "Our VAs are trained on 50+ platforms. No need to change your workflow—we adapt to yours.",
    callout: "<span class=\"font-bold text-gold\">Need a specific tool?</span> Just ask.",
    trainingNote: "Our VAs receive ongoing training on new platforms monthly. If you use it, we can work with it.",
    categories: {
      communication: "Communication",
      projectmanagement: "Project Management",
      productivity: "Productivity",
      design: "Design",
      crm: "CRM",
      support: "Support",
      cms: "CMS",
      ecommerce: "E‑commerce",
      marketing: "Marketing",
      seo: "SEO",
      socialmedia: "Social Media"
    }
  },
  whyChooseUs: {
    badge: "Why Choose Us",
    heading: "What makes us <span class=\"text-gold\">different</span>",
    description: "German-speaking talent, native quality control, fast onboarding, and a zero‑risk guarantee.",
    items: {
      eliteTalent: {
        title: "Elite, German‑speaking talent",
        description: "Carefully pre‑vetted assistants with excellent communication and reliability."
      },
      nativeOversight: {
        title: "Native quality oversight",
        description: "Every task is reviewed by a native‑level supervisor to ensure accuracy."
      },
      fastScaling: {
        title: "Scale in days, not months",
        description: "Onboard in 48 hours and add capacity quickly as your workload grows."
      },
      zeroRisk: {
        title: "Zero‑risk replacement",
        description: "If the fit isn’t perfect, we provide a replacement within 24 hours."
      },
      partnership: {
        title: "Long‑term partnership",
        description: "We align with your goals and continuously optimize your workflows."
      },
      trackRecord: {
        title: "Proven results",
        description: "Trusted by 200+ businesses with measurable cost savings and output gains."
      }
    }
  },
  hero: {
    title: "Scale Your Business with Dedicated Virtual Assistants",
    subtitle: "Hire pre-vetted, German-speaking virtual assistants for 80% less than local hires. Scale your team in days, not months.",
    ctaPrimary: "Get Started Today",
    ctaSecondary: "How It Works",
    tagline: "Trusted by 200+ Growing Businesses",
    stats: {
      clients: "Clients",
      costSaved: "Cost Saved",
      rating: "Rating"
    }
  },
  services: {
    title: "Our Services",
    subtitle: "Comprehensive virtual assistance for all your business needs",
    socialMedia: {
      title: "Social Media Management",
      description: "Content creation, scheduling, and engagement management across all platforms",
      benefit: "3-5x increase in engagement rates"
    },
    customerSupport: {
      title: "Customer Support",
      description: "Email, chat, and phone support with native language proficiency",
      benefit: "95%+ customer satisfaction scores"
    },
    backOffice: {
      title: "Back-Office & Admin",
      description: "Data entry, email management, calendar coordination, and document processing",
      benefit: "Save 20+ hours per week"
    },
    seo: {
      title: "SEO & Content",
      description: "Blog writing, keyword research, on-page optimization, and link building",
      benefit: "2x organic traffic growth"
    }
  },
  valueProposition: {
    heading: "Why <span class=\"text-gold\">Choose Us</span>",
    items: {
      costReduction: {
        title: "Up to 70% Cost Reduction",
        description: "Save on salaries, overhead, and training while maintaining top quality."
      },
      qualityControl: {
        title: "Native Quality Control",
        description: "Every deliverable is reviewed by a native-level supervisor for accuracy."
      },
      replacement: {
        title: "24h Replacement Guarantee",
        description: "If something isn't the right fit, we'll replace your VA within 24 hours."
      },
      confidentiality: {
        title: "Confidential & Secure",
        description: "Strict NDAs and secure processes to protect your business data."
      }
    }
  },
  howItWorks: {
    badge: "How It Works",
    heading: "Get started in <span class=\"text-gold\">4 simple steps</span>",
    description: "From onboarding to measurable results — our process is designed to be fast, clear, and efficient.",
    steps: {
      step1: {
        step: "Step 1",
        title: "Book a free consultation",
        description: "Tell us your goals, workflows, and the skills you need. We'll advise on the best setup."
      },
      step2: {
        step: "Step 2",
        title: "Meet pre‑vetted talent",
        description: "We shortlist German‑speaking VAs matched to your requirements. You choose who to start with."
      },
      step3: {
        step: "Step 3",
        title: "Start in 48 hours",
        description: "We onboard your VA, align tools and SOPs, and set up quality control."
      },
      step4: {
        step: "Step 4",
        title: "Scale and optimize",
        description: "Track results, iterate tasks, and add capacity as needed — we handle replacements within 24h."
      }
    }
  },
  pricing: {
    bannerBadge: "Free Trial",
    bannerTitle: "Try DON VA with no commitment",
    bannerSubtitle: "Start with a risk‑free trial and experience native quality control from day one.",
    bannerPoints: {
      noCommitment: "No long‑term commitment",
      cancelAnytime: "Cancel anytime",
      fullAccess: "Full access to tools & support"
    },
    sectionBadge: "Pricing",
    sectionTitle: "Simple, transparent pricing",
    sectionDescription: "Choose a plan and number of VAs that fits your needs. Scale up or down anytime.",
    vaCountLabel: "How many virtual assistants do you need?",
    vaCountHelper: "You can add or remove VAs at any time.",
    startingFrom: "Starting from €{{price}}/mo (~€{{hourly}}/hour)",
    bulkDiscount: "Bulk discount: {{percent}}% off",
    bulkSavings: "You save €{{amount}}/mo",
    bulkHint: "Add {{count}} more VA{{suffix}} to unlock a {{percent}}% discount",
    planSetupFee: "One‑time setup fee: €{{fee}}",
    planNoSetupFee: "No setup fee",
    button: "Get Started",
    hoursUnit: "hours",
    perMonth: "/mo",
    plans: {
      starter: {
        name: "Starter",
        hours: "10h / week",
        badge: "",
        features: [
          "Dedicated VA",
          "Native Quality Control",
          "24h Replacement Guarantee",
          "Slack/Email Support",
          "14 Days Money-Back Warranty"
        ]
      },
      professional: {
        name: "Professional",
        hours: "20h / week",
        badge: "",
        features: [
          "Everything in Starter",
          "No Setup Fee",
          "Priority Support",
          "Bi-weekly Progress Reports",
          "Flexible Hour Rollover"
        ]
      },
      enterprise: {
        name: "Enterprise",
        hours: "40h / week",
        badge: "Best Value",
        features: [
          "Everything in Professional",
          "No Setup Fee",
          "Dedicated Account Manager",
          "Weekly Strategy Calls",
          "Custom Workflow Integration"
        ]
      }
    },
    disclaimer: "Prices shown are estimates based on selected VAs. Final quotes may vary based on role complexity and tooling."
  },
  testimonials: {
    title: "What our clients say",
    subtitle: "Success stories from businesses that have grown with us",
    heading: "Trusted by <span class=\"text-gold\">Growing Businesses</span>",
    subheading: "Real results from real companies scaling with DON VA.",
    items: {
      t1: {
        content: "DON VA helped us scale our customer support without compromising quality. We cut costs by 65% and improved response times significantly.",
        name: "Michael Schmidt",
        role: "CEO",
        company: "TechFlow GmbH"
      },
      t2: {
        content: "The social media management has been exceptional. Our engagement tripled, and the quality control is genuinely native-level.",
        name: "Sarah Weber",
        role: "Marketing Director",
        company: "Digital Marketing Pro"
      },
      t3: {
        content: "Finally found VAs that actually understand our business. The 24h replacement guarantee gave us confidence to scale quickly.",
        name: "Thomas Müller",
        role: "Operations Manager",
        company: "E-Commerce Solutions"
      }
    },
    caseStudy: {
      badge: "Success Story",
      title: "Case Study: <span class=\"text-gold\">70% Cost Reduction</span>",
      description: "See how a mid-sized e-commerce company reduced their operational costs by €42,000 annually while improving service quality.",
      cta: "View Full Case Study"
    }
  },
  blog: {
    badge: "Insights",
    heading: "Latest <span class=\"text-gold\">Insights</span>",
    description: "Practical guides and strategies for scaling with virtual assistants.",
    by: "By",
    readMore: "Read more",
    read: "Read",
    detail: {
      notFound: "Article not found",
      returnHome: "Return to Home",
      backToHome: "Back to Home",
      authorDescription: "Insights from our expert network on scaling and operations.",
      shareX: "Share on X",
      shareLinkedIn: "Share on LinkedIn",
      copyLink: "Copy link",
      readyToTransform: "Ready to transform your operations?",
      ctaDescription: "Book a free consultation to get a tailored plan for your business.",
      bookConsultation: "Book a Free Consultation",
      getStarted: "Get Started",
      moreArticles: "More articles"
    }
  },
  caseStudies: {
    badge: "Success Stories",
    heading: "Real <span class=\"text-gold\">Success Stories</span>",
    description: "Proven results from teams scaling with DON VA.",
    labels: {
      saved: "Saved",
      teamSize: "Team Size",
      timeline: "Timeline",
      viewFull: "View full case study",
      viewStudy: "View study"
    },
    cta: {
      ready: "Ready to achieve similar results?",
      bookConsultation: "Book a Free Consultation",
      getStarted: "Get Started"
    },
    detail: {
      notFound: "Case study not found",
      returnHome: "Return to Home",
      backToHome: "Back to Home",
      annualSavings: "Annual savings",
      teamSize: "Team size",
      implementation: "Implementation time",
      theChallenge: "The Challenge",
      theSolution: "The Solution",
      theResults: "The Results",
      successAwaits: "Success awaits",
      readyToAchieve: "Ready to achieve",
      similarResults: "similar results?",
      ctaDescription: "Book a <strong>free 15‑minute consultation</strong>. No commitment, just a clear plan to scale.",
      bookFreeConsultation: "Book Free Consultation",
      viewAllCaseStudies: "View all case studies",
      noCommitment: "No commitment",
      minutes15: "15 minutes",
      free100: "100% free",
      moreSuccessStories: "More success stories",
      viewCaseStudy: "View case study"
    }
  },
  faq: {
    badge: "FAQ",
    title: "Frequently Asked Questions",
    description: "Answers to the most common questions about our service, quality control, and security.",
    items: {
      howFast: {
        q: "How quickly can I start with my virtual assistant?",
        a: "After our initial conversation, we can usually start with a suitable candidate within 48 hours."
      },
      notSatisfied: {
        q: "What if I'm not satisfied?",
        a: "We offer a 24h replacement guarantee. If the fit isn't right, we’ll swap your VA quickly at no extra charge."
      },
      germanQuality: {
        q: "How do you ensure native-level quality?",
        a: "Native German-speaking managers review work, provide feedback, and enforce style and accuracy standards."
      },
      scale: {
        q: "Can I scale the team up or down?",
        a: "Yes. You can adjust capacity within 48 hours to match your pipeline and seasonality."
      },
      tools: {
        q: "Do you work with our existing tools?",
        a: "Absolutely. We adapt to your stack — from Slack and Asana to HubSpot, Zendesk, and more."
      },
      security: {
        q: "How do you handle security and confidentiality?",
        a: "We sign NDAs, follow least‑privilege access, and use secure credential sharing and audit trails."
      }
    },
    qualityCardTitle: "Native Quality Control",
    qualityCardText: "Dedicated supervisors review outputs and coach continuously to maintain standards.",
    toolsCardTitle: "Works with Your Tools",
    toolsCardText: "We plug into your existing workflows and platforms without disrupting your operations.",
    stillHaveQuestionsTitle: "Still have questions?",
    stillHaveQuestionsText: "We're here to help you choose the right setup for your needs.",
    contactSupport: "Contact Support",
    viewPricing: "View Pricing"
  },
  contact: {
    title: "Contact Us",
    subtitle: "Have questions? We'd love to hear from you!",
    form: {
      name: "Name",
      email: "Email",
      phone: "Phone Number",
      message: "Message",
      submit: "Send Message",
      submitSending: "Sending...",
      success: "Thank you! We'll get back to you soon.",
      mainServiceLabel: "Main service you want VAs for",
      mainServicePlaceholder: "Select one main service",
      mainServiceOtherLabel: "What other service do you want VAs for?",
      mainServiceOtherPlaceholder: "Example: Lead generation, video editing, sales outreach, etc.",
      vaCountLabel: "How many VAs do you need?",
      vaCountPlaceholder: "e.g. 2",
      va1Label: "VA #1 – background / main tasks",
      va2IndustryLabel: "Main industry for VA #2",
      va2Label: "VA #2 – background / main tasks",
      va3IndustryLabel: "Main industry for VA #3",
      va3Label: "VA #3 – background / main tasks",
      va4IndustryLabel: "Main industry for VA #4",
      va4Label: "VA #4 – background / main tasks",
      otherTasksLabel: "Any other VA tasks?",
      otherTasksPlaceholder: "Example: Lead research, CRM updates, basic design tasks, etc.",
      validation: {
        emailRequired: "Email is required",
        emailInvalid: "Enter a valid email",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Enter a valid phone number",
        mainServiceRequired: "Please select one main service",
        vaCountRequired: "Please tell us how many VAs you need"
      }
    }
  },
  footer: {
    about: "About Us",
    services: "Services",
    contact: "Contact",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "© 2023 Your Company. All rights reserved."
  }
};

// German translations
const de = {
  nav: {
    services: "Dienstleistungen",
    howItWorks: "Wie es funktioniert",
    pricing: "Preise",
    testimonials: "Erfahrungsberichte",
    faq: "Häufige Fragen",
    contact: "Kontakt",
    getStarted: "Jetzt starten",
    bookMeeting: "Termin vereinbaren"
  },
  hero: {
    title: "Skalieren Sie Ihr Unternehmen mit virtuellen Assistenten",
    subtitle: "Engagieren Sie geprüfte, deutschsprachige virtuelle Assistenten für 80% weniger als lokale Mitarbeiter. Skalieren Sie Ihr Team in Tagen, nicht in Monaten.",
    ctaPrimary: "Jetzt loslegen",
    ctaSecondary: "Mehr erfahren",
    tagline: "Vertrauen Sie auf über 200 wachsende Unternehmen",
    stats: {
      clients: "Kunden",
      costSaved: "Kosteneinsparung",
      rating: "Bewertung"
    }
  },
  services: {
    title: "Unsere Dienstleistungen",
    subtitle: "Umfassende virtuelle Unterstützung für alle Ihre geschäftlichen Anforderungen",
    socialMedia: {
      title: "Social Media Management",
      description: "Erstellung von Inhalten, Zeitplanung und Community-Management auf allen Plattformen",
      benefit: "3-5x höhere Engagement-Raten"
    },
    customerSupport: {
      title: "Kundenservice",
      description: "E-Mail-, Chat- und Telefon-Support mit muttersprachlicher Kompetenz",
      benefit: "95%+ Kundenzufriedenheit"
    },
    backOffice: {
      title: "Büroorganisation & Verwaltung",
      description: "Dateneingabe, E-Mail-Verwaltung, Kalenderkoordination und Dokumentenverarbeitung",
      benefit: "Sparen Sie 20+ Stunden pro Woche"
    },
    seo: {
      title: "SEO & Content",
      description: "Blogbeiträge, Keyword-Recherche, Onpage-Optimierung und Linkaufbau",
      benefit: "Verdoppelung des organischen Traffics"
    }
  },
  toolsIntegration: {
    title: "Funktioniert mit Ihren bestehenden Tools",
    subtitle: "Unsere VAs sind auf 50+ Plattformen geschult. Sie müssen Ihren Workflow nicht ändern – wir passen uns an.",
    callout: "Benötigen Sie ein bestimmtes Tool? Sagen Sie einfach Bescheid.",
    trainingNote: "Unsere VAs werden monatlich zu neuen Plattformen weitergebildet. Wenn Sie es nutzen, können wir damit arbeiten.",
    categories: {
      communication: "Kommunikation",
      projectmanagement: "Projektmanagement",
      productivity: "Produktivität",
      design: "Design",
      crm: "CRM",
      support: "Support",
      cms: "CMS",
      ecommerce: "E‑Commerce",
      marketing: "Marketing",
      seo: "SEO",
      socialmedia: "Social Media"
    }
  },
  whyChooseUs: {
    badge: "Warum wir",
    heading: "Was uns <span class=\"text-gold\">auszeichnet</span>",
    description: "Deutschsprachige Talente, native Qualitätskontrolle, schnelles Onboarding und eine Null‑Risiko‑Garantie.",
    items: {
      eliteTalent: {
        title: "Elite, deutschsprachige Talente",
        description: "Sorgfältig vorselektierte Assistenten mit exzellenter Kommunikation und Zuverlässigkeit."
      },
      nativeOversight: {
        title: "Native Qualitätskontrolle",
        description: "Jede Aufgabe wird von einem muttersprachlichen Supervisor auf Genauigkeit geprüft."
      },
      fastScaling: {
        title: "Skalieren in Tagen, nicht Monaten",
        description: "Onboarding in 48 Stunden und schnelle Kapazitätserweiterung bei wachsender Auslastung."
      },
      zeroRisk: {
        title: "Null‑Risiko‑Ersatz",
        description: "Passt es nicht perfekt, stellen wir innerhalb von 24 Stunden Ersatz bereit."
      },
      partnership: {
        title: "Langfristige Partnerschaft",
        description: "Wir richten uns an Ihren Zielen aus und optimieren Ihre Abläufe kontinuierlich."
      },
      trackRecord: {
        title: "Bewährte Ergebnisse",
        description: "Vertrauen von 200+ Unternehmen mit messbaren Kosteneinsparungen und Leistungssteigerungen."
      }
    }
  },
  valueProposition: {
    heading: "Warum <span class=\"text-gold\">wir</span>?",
    items: {
      costReduction: {
        title: "Bis zu 70% Kostensenkung",
        description: "Sparen Sie Gehälter, Overhead und Einarbeitung – bei gleichbleibender Top-Qualität."
      },
      qualityControl: {
        title: "Native Qualitätskontrolle",
        description: "Jede Leistung wird von einem muttersprachlichen Supervisor auf Genauigkeit geprüft."
      },
      replacement: {
        title: "24h Ersatzgarantie",
        description: "Falls etwas nicht passt, ersetzen wir Ihren VA innerhalb von 24 Stunden."
      },
      confidentiality: {
        title: "Vertraulich & Sicher",
        description: "Strenge NDAs und sichere Prozesse zum Schutz Ihrer Geschäftsdaten."
      }
    }
  },
  howItWorks: {
    badge: "So funktioniert's",
    heading: "In <span class=\"text-gold\">4 einfachen Schritten</span> startklar",
    description: "Vom Onboarding bis zu messbaren Ergebnissen – unser Prozess ist schnell, klar und effizient.",
    steps: {
      step1: {
        step: "Schritt 1",
        title: "Kostenlose Beratung buchen",
        description: "Teilen Sie uns Ihre Ziele, Abläufe und benötigten Fähigkeiten mit. Wir empfehlen das optimale Setup."
      },
      step2: {
        step: "Schritt 2",
        title: "Geprüfte Talente kennenlernen",
        description: "Wir stellen deutschsprachige VAs passend zu Ihren Anforderungen vor. Sie wählen, mit wem Sie starten."
      },
      step3: {
        step: "Schritt 3",
        title: "Start in 48 Stunden",
        description: "Wir onboarden Ihren VA, richten Tools und SOPs ein und etablieren die Qualitätskontrolle."
      },
      step4: {
        step: "Schritt 4",
        title: "Skalieren und optimieren",
        description: "Ergebnisse verfolgen, Aufgaben iterieren und Kapazitäten nach Bedarf erweitern – Ersatz innerhalb von 24 Std."
      }
    }
  },
  pricing: {
    bannerBadge: "Kostenlos testen",
    bannerTitle: "DON VA unverbindlich ausprobieren",
    bannerSubtitle: "Starten Sie risikofrei und erleben Sie native Qualitätskontrolle vom ersten Tag an.",
    bannerPoints: {
      noCommitment: "Keine langfristige Bindung",
      cancelAnytime: "Jederzeit kündbar",
      fullAccess: "Voller Zugriff auf Tools & Support"
    },
    sectionBadge: "Preise",
    sectionTitle: "Einfache, transparente Preise",
    sectionDescription: "Wählen Sie die passende Anzahl an VAs. Skalieren Sie jederzeit hoch oder runter.",
    vaCountLabel: "Wie viele virtuelle Assistenten benötigen Sie?",
    vaCountHelper: "Sie können VAs jederzeit hinzufügen oder entfernen.",
    startingFrom: "Ab €{{price}}/Monat (~€{{hourly}}/Stunde)",
    bulkDiscount: "Mengenrabatt: {{percent}}% Rabatt",
    bulkSavings: "Sie sparen €{{amount}}/Monat",
    bulkHint: "Fügen Sie {{count}} weiteren VA{{suffix}} hinzu, um {{percent}}% Rabatt zu erhalten",
    planSetupFee: "Einmalige Einrichtungsgebühr: €{{fee}}",
    planNoSetupFee: "Keine Einrichtungsgebühr",
    button: "Jetzt starten",
    disclaimer: "Die Preise sind Schätzungen basierend auf der Auswahl. Das endgültige Angebot kann je nach Aufgabenprofil und Tools variieren."
  },
  testimonials: {
    title: "Was unsere Kunden sagen",
    subtitle: "Erfolgsgeschichten von Unternehmen, die mit uns wachsen",
    heading: "Vertrauen von <span class=\"text-gold\">wachsenden Unternehmen</span>",
    subheading: "Echte Ergebnisse von Unternehmen, die mit DON VA skalieren.",
    items: {
      t1: {
        content: "DON VA hat uns geholfen, unseren Kundensupport zu skalieren, ohne Abstriche bei der Qualität zu machen. Wir haben die Kosten um 65 % gesenkt und die Reaktionszeiten deutlich verbessert.",
        name: "Michael Schmidt",
        role: "Geschäftsführer",
        company: "TechFlow GmbH"
      },
      t2: {
        content: "Das Social-Media-Management war außergewöhnlich. Unser Engagement hat sich verdreifacht und die Qualitätskontrolle ist auf muttersprachlichem Niveau.",
        name: "Sarah Weber",
        role: "Marketingleiterin",
        company: "Digital Marketing Pro"
      },
      t3: {
        content: "Endlich VAs, die unser Geschäft wirklich verstehen. Die 24-Stunden-Ersatzgarantie gab uns die Sicherheit, schnell zu skalieren.",
        name: "Thomas Müller",
        role: "Betriebsleiter",
        company: "E‑Commerce Solutions"
      }
    },
    caseStudy: {
      badge: "Erfolgsgeschichte",
      title: "Fallstudie: <span class=\"text-gold\">70% Kostensenkung</span>",
      description: "Wie ein mittelständisches E‑Commerce‑Unternehmen seine Betriebskosten jährlich um 42.000 € senkte und gleichzeitig die Servicequalität verbesserte.",
      cta: "Komplette Fallstudie ansehen"
    }
  },
  faq: {
    badge: "FAQ",
    title: "Häufig gestellte Fragen",
    description: "Antworten auf die häufigsten Fragen zu unserem Service, Qualitätskontrolle und Sicherheit.",
    items: {
      howFast: {
        q: "Wie schnell kann ich mit meinem virtuellen Assistenten starten?",
        a: "Nach unserem ersten Gespräch können wir in der Regel innerhalb von 48 Stunden mit einem passenden Kandidaten starten."
      },
      notSatisfied: {
        q: "Was ist, wenn ich nicht zufrieden bin?",
        a: "Wir bieten eine 24‑Stunden‑Ersatzgarantie. Wenn es nicht passt, tauschen wir Ihren VA schnell und kostenfrei aus."
      },
      germanQuality: {
        q: "Wie stellen Sie native Qualität sicher?",
        a: "Muttersprachliche Manager prüfen Arbeiten, geben Feedback und sichern Stil sowie Genauigkeit."
      },
      scale: {
        q: "Kann ich das Team skalieren?",
        a: "Ja. Sie können die Kapazität innerhalb von 48 Stunden an Pipeline und Saisonalität anpassen."
      },
      tools: {
        q: "Arbeiten Sie mit unseren bestehenden Tools?",
        a: "Natürlich. Wir passen uns Ihrem Stack an – von Slack und Asana bis HubSpot, Zendesk und mehr."
      },
      security: {
        q: "Wie gewährleisten Sie Sicherheit und Vertraulichkeit?",
        a: "NDAs, Least‑Privilege‑Zugriffe sowie sichere Passwort‑Freigabe und Audit‑Trails sind Standard."
      }
    },
    qualityCardTitle: "Native Qualitätskontrolle",
    qualityCardText: "Dedizierte Supervisoren prüfen Ergebnisse und coachen kontinuierlich, um Standards zu halten.",
    toolsCardTitle: "Funktioniert mit Ihren Tools",
    toolsCardText: "Wir integrieren uns in Ihre bestehenden Workflows und Plattformen ohne Unterbrechung.",
    stillHaveQuestionsTitle: "Noch Fragen?",
    stillHaveQuestionsText: "Wir helfen Ihnen gern, das passende Setup zu wählen.",
    contactSupport: "Support kontaktieren",
    viewPricing: "Preise ansehen"
  },
  contact: {
    title: "Kontaktieren Sie uns",
    subtitle: "Haben Sie Fragen? Wir freuen uns von Ihnen zu hören!",
    form: {
      name: "Name",
      email: "E-Mail",
      phone: "Telefonnummer",
      message: "Nachricht",
      submit: "Nachricht senden",
      submitSending: "Senden...",
      success: "Vielen Dank! Wir melden uns in Kürze bei Ihnen.",
      mainServiceLabel: "Hauptleistung, für die Sie VAs möchten",
      mainServicePlaceholder: "Wählen Sie eine Hauptleistung",
      mainServiceOtherLabel: "Welche andere Leistung benötigen Sie?",
      mainServiceOtherPlaceholder: "Beispiel: Leadgenerierung, Videoschnitt, Sales Outreach, etc.",
      vaCountLabel: "Wie viele VAs benötigen Sie?",
      vaCountPlaceholder: "z. B. 2",
      va1Label: "VA #1 – Hintergrund / Hauptaufgaben",
      va2IndustryLabel: "Hauptbranche für VA #2",
      va2Label: "VA #2 – Hintergrund / Hauptaufgaben",
      va3IndustryLabel: "Hauptbranche für VA #3",
      va3Label: "VA #3 – Hintergrund / Hauptaufgaben",
      va4IndustryLabel: "Hauptbranche für VA #4",
      va4Label: "VA #4 – Hintergrund / Hauptaufgaben",
      otherTasksLabel: "Weitere VA-Aufgaben?",
      otherTasksPlaceholder: "Beispiel: Leadrecherche, CRM-Updates, einfache Designaufgaben, etc.",
      validation: {
        emailRequired: "E-Mail ist erforderlich",
        emailInvalid: "Bitte geben Sie eine gültige E-Mail ein",
        phoneRequired: "Telefonnummer ist erforderlich",
        phoneInvalid: "Bitte geben Sie eine gültige Telefonnummer ein",
        mainServiceRequired: "Bitte wählen Sie eine Hauptleistung",
        vaCountRequired: "Bitte geben Sie an, wie viele VAs Sie benötigen"
      }
    }
  },
  footer: {
    about: "Über uns",
    services: "Dienstleistungen",
    contact: "Kontakt",
    legal: "Rechtliches",
    privacy: "Datenschutz",
    terms: "AGB",
    copyright: "© 2023 Ihr Unternehmen. Alle Rechte vorbehalten."
  }
};


i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de }
  },
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
