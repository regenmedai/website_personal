import React, { useState } from 'react';
// Using Lucide icons for a clean look
import { Menu, X, Briefcase, BrainCircuit, Activity, CheckCircle } from 'lucide-react';

// Main App Component
function App() {
  // --- State Hooks ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Data Definitions ---
  const companyName = 'regenmed.ai';
  const contactEmail = 'info@regenmedai.com';
  const location = 'Wildomar, CA 92595';
  const experienceBlurb = 
    'With over 15 years of combined experience across emergency care, director of nursing leadership in ASCs, aesthetic medicine, and administrative medical operations—including coding and billing—regenmed.ai brings both clinical and operational expertise to every AI integration project.';

  const services = [
    { title: 'AI Strategy & Roadmap', description: 'Tailored AI blueprints for operational efficiency and clinical innovation.', icon: Briefcase },
    { title: 'Clinical Workflow Automation', description: 'Integrating intelligent automation into your existing systems seamlessly.', icon: BrainCircuit },
    { title: 'Predictive Analytics & Insights', description: 'Leveraging data to forecast trends, optimize resources, and enhance patient care.', icon: Activity },
  ];

  const whyPoints = [
    'Deep clinical and operational expertise',
    'Custom-built, validated AI solutions',
    'Focus on ethical & responsible AI implementation',
    'Measurable ROI and performance tracking',
    'Collaborative partnership approach',
  ];

  // --- Event Handlers ---
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // --- JSX Structure ---
  return (
    <div className="bg-brand-bg text-brand-textPrimary">
      {/* === Header === */}
      <header className="bg-brand-bg/95 backdrop-blur-sm shadow-sm fixed w-full z-50 top-0 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Text */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#hero" aria-label={`${companyName} homepage`} className="text-2xl font-bold text-brand-primary">
                {companyName}
              </a>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="text-sm font-medium text-brand-textSecondary hover:text-brand-primary transition-colors">Services</a>
              <a href="#why-us" className="text-sm font-medium text-brand-textSecondary hover:text-brand-primary transition-colors">Why Us</a>
              <a href="#contact" className="text-sm font-medium text-brand-textSecondary hover:text-brand-primary transition-colors">Contact</a>
            </nav>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMobileMenu} type="button" className="p-2 text-brand-textSecondary hover:text-brand-primary" aria-label="Toggle menu">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-brand-bg shadow-lg py-2">
            <nav className="container mx-auto px-4 space-y-1">
              <a href="#services" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-brand-textSecondary hover:text-brand-primary hover:bg-brand-bgSubtle">Services</a>
              <a href="#why-us" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-brand-textSecondary hover:text-brand-primary hover:bg-brand-bgSubtle">Why Us</a>
              <a href="#contact" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-brand-textSecondary hover:text-brand-primary hover:bg-brand-bgSubtle">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* === Main Content === */}
      <main className="pt-16"> {/* Offset for fixed header */}
        {/* --- Hero Section --- */}
        <section id="hero" className="py-20 md:py-32 bg-brand-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-primary mb-4">
              Intelligent Automation for Modern Healthcare
            </h1>
            <p className="mt-4 text-lg md:text-xl text-brand-textSecondary max-w-3xl mx-auto mb-8">
              {companyName} provides premium AI consulting and implementation, empowering clinics, medspas, and surgical centers to optimize operations and enhance patient care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="#contact" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:opacity-90 transition-opacity whitespace-nowrap">
                Request a Consultation
              </a>
              <a href="#services" className="inline-flex items-center justify-center px-8 py-3 border border-brand-border text-base font-medium rounded-md text-brand-primary bg-brand-bg hover:bg-brand-bgSubtle transition-colors whitespace-nowrap">
                Explore Services
              </a>
            </div>
          </div>
        </section>

        {/* --- Services Section --- */}
        <section id="services" className="py-16 md:py-24 bg-brand-bgSubtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl">Our Core AI Solutions</h2>
              <p className="mt-3 text-lg text-brand-textSecondary max-w-2xl mx-auto">Leveraging AI to solve specific challenges in healthcare operations and clinical workflows.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.title} className="bg-brand-bg p-6 rounded-lg border border-brand-border shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-primary text-white mr-4">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <h3 className="text-lg font-semibold text-brand-primary">{service.title}</h3>
                    </div>
                    <p className="text-sm text-brand-textSecondary">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- Why Choose Us Section --- */}
        <section id="why-us" className="py-16 md:py-24 bg-brand-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl mb-4">Why Partner with {companyName}?</h2>
                <p className="text-lg text-brand-textSecondary mb-6">
                  {experienceBlurb}
                </p>
                <ul className="space-y-3">
                  {whyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-brand-primary mr-2 mt-0.5" aria-hidden="true" />
                      <span className="text-sm text-brand-textSecondary">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden md:block bg-brand-bgSubtle rounded-lg p-8 border border-brand-border">
                 <h3 className="text-lg font-semibold text-brand-primary mb-4">Key Focus Areas</h3>
                 <ul className="list-disc list-inside space-y-2 text-sm text-brand-textSecondary">
                    <li>Clinic Operations Optimization</li>
                    <li>Patient Journey Automation</li>
                    <li>Administrative Task Reduction</li>
                    <li>Data-Driven Decision Support</li>
                    <li>Regulatory Compliance AI</li>
                 </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- Contact Section (Simplified) --- */}
        <section id="contact" className="py-16 md:py-24 bg-brand-bgSubtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl">Contact Us</h2>
              <p className="mt-3 text-lg text-brand-textSecondary mb-8">Reach out to discuss how AI can transform your practice.</p>
              
              <div className="bg-brand-bg p-6 rounded-lg border border-brand-border shadow-sm inline-block">
                 <p className="text-base text-brand-textSecondary">
                     Email: <a href={`mailto:${contactEmail}`} className="text-brand-primary hover:underline">{contactEmail}</a>
                 </p>
                 <p className="mt-2 text-base text-brand-textSecondary">
                     Location: {location}
                 </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* === Footer (Uncommented) === */}
      <footer className="bg-brand-primary text-brand-bgSubtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
               <span className="text-lg font-semibold text-white">
                 {companyName}
               </span>
               <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>{location}</p>
              <p><a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 