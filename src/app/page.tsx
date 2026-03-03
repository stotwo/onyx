/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Clock, User, Check, Scissors, Instagram, Phone, MapPin, ChevronRight, ChevronDown, ArrowLeft, Mail } from 'lucide-react';

type GalleryItem = {
  type: 'image' | 'video';
  src: string;
  link?: string;
};

export default function Home() {
  const [bookingStep, setBookingStep] = useState(0); // 0: Service, 1: Date, 2: Time, 3: Form
  const [selectedService, setSelectedService] = useState<{name: string, price: number, duration: string} | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isHomeVisit, setIsHomeVisit] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phonePrefix: '+32',
    email: '',
    address: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const countries = [
    { code: '+32', flag: '🇧🇪', label: 'Belgique' },
    { code: '+33', flag: '🇫🇷', label: 'France' },
    { code: '+352', flag: '🇱🇺', label: 'Luxembourg' },
    { code: '+31', flag: '🇳🇱', label: 'Pays-Bas' },
    { code: '+49', flag: '🇩🇪', label: 'Allemagne' },
  ];

  // Auto-detect country code based on timezone
  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let prefix = '+32'; // Default BE

      if (timeZone === 'Europe/Paris') prefix = '+33';
      else if (timeZone === 'Europe/Amsterdam') prefix = '+31';
      else if (timeZone === 'Europe/Berlin') prefix = '+49';
          if (timeZone === 'Europe/Luxembourg') prefix = '+352';
          
          setTimeout(() => {
            setFormData(prev => {
              if (prev.phonePrefix === prefix) return prev;
              return { ...prev, phonePrefix: prefix };
            });
          }, 0);
        } catch (e) {
      console.log(e);
    }
  }, []);

  // Services
  const services = [
    { name: "PROTOCOL: CUT", price: 30, duration: "45 MIN" },
    { name: "SYSTEM RESET (FULL)", price: 70, duration: "90 MIN" }
  ];

  // Generate next 14 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }
    return days;
  };
  const availableDays = getNextDays();

  // Helper to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date).toUpperCase();
  };

  // Hours: 10h-20h
  const timeSlots = [
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const getPriceDetails = () => {
    if (!selectedService || !selectedDate || !selectedTime) return null;

    let total = selectedService.price;
    const supplements = [];

    // 1. SOS Coiffure (< 24h)
    const bookingDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    // We want to check strictly if the booking is in the future but less than 24h
    // diffInMs is positive if booking is in future
    const diffInMs = bookingDate.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    // Check if it's really close (e.g. today or <= 24h from right now)
    if (diffInHours > 0 && diffInHours <= 24) {
        supplements.push({ name: "PRIORITY ACCESS (<24H)", price: 5 });
        total += 5;
    }

    // 2. Hors Horaires (10h-12h et 18h-20h)
    // 10:00, 11:00 are < 12. 18:00, 19:00, 20:00 are >= 18.
    const slotHour = parseInt(selectedTime.split(':')[0]);
    if (slotHour < 12 || slotHour >= 18) {
        supplements.push({ name: "EXTENDED HOURS", price: 10 });
        total += 10;
    }

    // 3. Domicile
    if (isHomeVisit) {
        supplements.push({ name: "MOBILE UNIT DEPLOYMENT", price: 100 });
        total += 100;
    }

    return { total, supplements };
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation Téléphone (au moins 9 chiffres)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
        alert("ERREUR: NUMÉRO DE TÉLÉPHONE INVALIDE. VEUILLEZ RÉESSAYER.");
        return;
    }

    // 2. Validation Email (format standard avec @ et point)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(formData.email)) {
        alert("ERREUR: FORMAT EMAIL INVALIDE.");
        return;
    }
    
    // 3. Validation Adresse (si domicile : longueur + présence d'espace)
    if (isHomeVisit) {
        if (formData.address.trim().length < 10 || !formData.address.trim().includes(' ')) {
            alert("ERREUR: ADRESSE INCOMPLÈTE. ADRESSE COMPLÈTE REQUISE.");
            return;
        }
    }

    const priceDetails = getPriceDetails();
    
    // Simulate API call to save booking
    console.log('Booking submitted:', { 
        ...formData, 
        service: selectedService, 
        date: selectedDate, 
        time: selectedTime,
        isHomeVisit,
        priceDetails
    });
    
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setBookingStep(0);
      setFormData({ name: '', phone: '', phonePrefix: '+32', email: '', address: '' });
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setIsHomeVisit(false);
      alert("Demande de rendez-vous enregistrée ! Vous allez recevoir une confirmation par SMS et par email."); 
    }, 2000);
  };

  const galleryItems: GalleryItem[] = [
    { type: 'image', src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop" },
    { type: 'image', src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz2I2c8JqJLiM1pFztAQkxlZXkGHlNLk27A&s" },
    { type: 'image', src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop" },
    { type: 'image', src: "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=800&auto=format&fit=crop" },
    { type: 'image', src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop" },
    { type: 'image', src: "https://www.shutterstock.com/image-photo/professional-barber-shaving-clients-nape-600nw-2622842183.jpg" }
  ];

  return (
    <div className="min-h-screen font-sans text-neutral-200 bg-neutral-950 selection:bg-cyan-500 selection:text-black">
      <style jsx global>{`
        /* Typography Outline */
        .text-outline {
            -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
            color: transparent;
        }
      `}</style>

      {/* Navigation - Floating Minimal */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 mix-blend-difference text-white transition-opacity duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-cyan-400/50 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] bg-cyan-900/10 backdrop-blur-md">
                    <Scissors className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="font-bold tracking-[0.2em] text-sm uppercase hidden md:block">ONYX LAB</span>
            </div>
            
            <a href="#reservation" className="group px-6 py-3 border border-cyan-400/30 bg-black/50 backdrop-blur-md text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all rounded-full">
                <span className="group-hover:hidden text-cyan-400">Réserver</span>
                <span className="hidden group-hover:block">Maintenant</span>
            </a>
        </div>
      </nav>

      {/* HERO SECTION: MODERN & CLEAN */}
      <section id="accueil" className="relative h-screen w-full overflow-hidden bg-neutral-950">
        
        {/* BACKGROUND: Clean & Atmospheric */}
        <div className="absolute inset-0 z-0">
             {/* Background Image - High Quality Barber Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
             {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/80 to-transparent"></div>
        </div>
            
        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col items-center justify-center text-center">
                
                {/* Main Title - Clean Sans Serif */}
                <div className="relative mb-6">
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white select-none">
                        ONYX<span className="text-cyan-500">.</span>
                    </h1>
                </div>

                <p className="mt-4 text-neutral-400 text-sm md:text-lg uppercase tracking-[0.3em] font-medium px-6 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                    Precision Grooming • Est. 2026
                </p>
                
                {/* Floating CTA Buttons - Rounded */}
                <div className="mt-12 flex flex-col md:flex-row gap-4 animate-fade-in-up">
                    <a href="#reservation" className="relative overflow-hidden bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest px-8 py-4 transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-full text-sm">
                        Commencer le rituel
                    </a>
                    <a href="#galerie" className="border border-white/20 hover:border-cyan-400 hover:text-cyan-400 text-white font-bold uppercase tracking-widest px-8 py-4 transition-colors backdrop-blur-md rounded-full text-sm">
                        Réalisations
                    </a>
                </div>
        </div>

        {/* Desktop Decor - Simplified */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce opacity-50">
             <span className="text-neutral-500 text-[10px] uppercase tracking-widest">Découvrir</span>
             <ChevronDown className="w-4 h-4 text-neutral-500" />
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galerie" className="py-24 bg-black border-t border-neutral-900 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/20 blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">RÉALISATIONS</h2>
              <p className="text-cyan-400 font-bold tracking-[0.2em] text-xs uppercase pl-1">Précision & Chaos</p>
            </div>
            <a href="#" className="text-neutral-500 hover:text-cyan-400 mt-4 md:mt-0 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-transparent hover:border-cyan-400/50 pb-1 transition-all">
              Portfolio Complet <span className="text-lg">→</span>
            </a>
          </div>
          
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {galleryItems.map((item, index) => {
              if (item.type === 'video') {
                return (
                  <div key={index} className="group relative aspect-square overflow-hidden bg-neutral-900 border border-neutral-800">
                    <video 
                      src={item.src}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </div>
                );
              }
              
              return (
                <div key={index} className="group relative aspect-square overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl">
                    <img 
                    src={item.src} 
                    alt={`Coupe ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="reservation" className="py-24 bg-neutral-950 relative overflow-hidden border-t border-neutral-900">
        {/* Background Ambient Glows - Softer */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-6xl mx-auto">
            
            {/* Left Column: The Booking Flow */}
            <div className="lg:w-3/5">
                <div className="mb-8">
                    <span className="text-cyan-500 font-bold tracking-widest text-xs uppercase mb-2 block rounded-full bg-cyan-900/20 px-3 py-1 w-fit">Réservation</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Réservez votre créneau.</h2>
                    <p className="text-neutral-400 text-lg">Coiffure de précision pour l'individu moderne.</p>
                </div>

                <div className="bg-neutral-900/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                    
                    {/* Step Navigation Header */}
                    {bookingStep > 0 && (
                        <button 
                            onClick={() => setBookingStep(bookingStep - 1)}
                            className="absolute top-6 left-6 p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors z-20"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    <div className="mb-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            {[0, 1, 2, 3].map((step) => (
                                <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${step <= bookingStep ? 'w-12 bg-cyan-500' : 'w-3 bg-neutral-800'}`}></div>
                            ))}
                        </div>
                    </div>

                    <div className="min-h-100 flex flex-col">
                        {/* STEP 0: CHOIX PRESTATION */}
                        {bookingStep === 0 && (
                            <div className="animate-fade-in flex flex-col gap-4 h-full">
                                <h3 className="text-xl font-bold text-white mb-4 text-center">Choisir la prestation</h3>
                                <div className="grid grid-cols-1 gap-3 grow">
                                    {services.map((service, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedService(service); setBookingStep(1); }}
                                            className="group relative flex items-center justify-between p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:border-cyan-500/50 hover:bg-neutral-900 transition-all duration-300 text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <span className="block text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{service.name}</span>
                                                    <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{service.duration}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-bold text-white">{service.price}€</span>
                                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-black transition-all" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 1: DATE */}
                        {bookingStep === 1 && (
                            <div className="animate-fade-in h-full flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-6 text-center">Choisir la date</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableDays.map((day, idx) => {
                                        const isMonday = day.getDay() === 1; // Lundi
                                        
                                        // Calculate available slots
                                        let availableCount = 0;
                                        const now = new Date();
                                        
                                        // Compare dates strictly without time
                                        const todaySet = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                        const daySet = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                                        const isToday = daySet.getTime() === todaySet.getTime();
                                        const isPast = daySet.getTime() < todaySet.getTime();

                                        if (!isMonday && !isPast) {
                                            availableCount = timeSlots.filter(t => {
                                                if (!isToday) return true;
                                                // If today, strictly check if slot hour is in future
                                                const h = parseInt(t.split(':')[0]);
                                                return h > now.getHours();
                                            }).length;
                                        }

                                        // Force close if count is 0
                                        const isClosed = isMonday || availableCount === 0 || isPast;
                                        const isSelected = selectedDate?.toDateString() === day.toDateString();
                                        
                                        return (
                                            <button
                                                key={idx}
                                                disabled={isClosed}
                                                onClick={() => { setSelectedDate(day); setBookingStep(2); }}
                                                className={`
                                                    relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1
                                                    ${isSelected 
                                                        ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' 
                                                        : isClosed
                                                            ? 'bg-neutral-950/30 border-transparent opacity-20 grayscale cursor-not-allowed'
                                                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-cyan-500/30 hover:text-white hover:bg-neutral-800'
                                                    }
                                                `}
                                            >
                                                <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">{formatDate(day).split(' ')[0]}</span>
                                                <span className="text-2xl font-black">{day.getDate()}</span>
                                                <span className="text-[10px] opacity-70 capitalize">{formatDate(day).split(' ')[2]}</span>
                                                
                                                {!isClosed ? (
                                                    <span className={`text-[9px] font-bold mt-2 px-2 py-0.5 rounded-full uppercase tracking-wider ${isSelected ? 'bg-black/20 text-black' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                                        {availableCount} slots
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold mt-2 uppercase tracking-wider text-neutral-600">
                                                        {isMonday ? 'FERMÉ' : 'COMPLET'}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: TIME */}
                        {bookingStep === 2 && (
                            <div className="animate-fade-in h-full flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 text-center">Choisir l'heure</h3>
                                <p className="text-center text-cyan-400 text-xs font-bold uppercase mb-8 inline-block mx-auto bg-cyan-900/20 px-3 py-1 rounded-full">{selectedDate && formatDate(selectedDate)}</p>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots.map((time) => {
                                        const h = parseInt(time.split(':')[0]);
                                        const m = parseInt(time.split(':')[1]);
                                        const now = new Date();
                                        
                                        // Hide past time slots if today
                                        if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
                                          if (h <= now.getHours()) return null;
                                        }

                                        let surcharge = 0;
                                        // 1. Off Hours (+10€)
                                        if (h < 12 || h >= 18) surcharge += 10;

                                        // 2. SOS Coiffure (< 24h) (+5€)
                                        if (selectedDate) {
                                            const slotDate = new Date(selectedDate);
                                            slotDate.setHours(h, m, 0, 0);
                                            const diffInMs = slotDate.getTime() - now.getTime();
                                            const diffInHours = diffInMs / (1000 * 60 * 60);
                                            if (diffInHours > 0 && diffInHours <= 24) surcharge += 5;
                                        }

                                        return (
                                        <button
                                            key={time}
                                            onClick={() => { setSelectedTime(time); setBookingStep(3); }}
                                            className="group relative py-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:bg-cyan-500 hover:border-cyan-500 hover:text-black transition-all font-bold text-lg flex flex-col items-center justify-center gap-1"
                                        >
                                            <span>{time}</span>
                                            {surcharge > 0 && <span className="text-[9px] text-cyan-400 font-bold bg-cyan-900/30 px-2 py-0.5 rounded-full group-hover:bg-black/20 group-hover:text-black">+{surcharge}€</span>}
                                        </button>
                                    )})}
                                </div>
                            </div>
                        )}

                         {/* STEP 3: FORM */}
                         {bookingStep === 3 && (
                            <form onSubmit={handleBookingSubmit} className="animate-fade-in flex flex-col h-full justify-between">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white mb-6 text-center">Vos coordonnées</h3>
                                    
                                    {/* Recap Card */}
                                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 mb-4 backdrop-blur-sm">
                                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-neutral-800">
                                            <div>
                                                <p className="font-bold text-white text-lg">{selectedService?.name}</p>
                                                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">{selectedDate && formatDate(selectedDate)} @ {selectedTime}</p>
                                            </div>
                                            <span className="font-bold text-cyan-400 text-lg">{selectedService?.price}€</span>
                                        </div>
                                        
                                        {/* Supplements Display */}
                                        {(() => {
                                            const details = getPriceDetails();
                                            if (!details || !details.supplements.length) return null;
                                            return (
                                                <div className="space-y-2 mb-4 pb-4 border-b border-neutral-800">
                                                    {details.supplements.map((s, i) => (
                                                        <div key={i} className="flex justify-between text-xs text-neutral-400 font-medium">
                                                            <span>{s.name}</span>
                                                            <span className="text-cyan-400">+{s.price}€</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}

                                        <div className="flex justify-between items-center pt-2">
                                             <span className="text-white text-sm font-bold uppercase tracking-wider">Total Estimé</span>
                                             <span className="font-black text-white text-2xl">{getPriceDetails()?.total}€</span>
                                        </div>
                                    </div>

                                    {/* Home Visit Option */}
                                    <button 
                                        type="button"
                                        onClick={() => setIsHomeVisit(!isHomeVisit)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${
                                            isHomeVisit 
                                            ? 'bg-neutral-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                            : 'bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-600'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <span className={`block font-bold transition-colors ${isHomeVisit ? 'text-white' : 'text-neutral-300'}`}>À Domicile</span>
                                            <span className="text-xs text-neutral-500 uppercase tracking-widest">Frais de déplacement</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold font-mono transition-colors ${isHomeVisit ? 'text-cyan-400' : 'text-neutral-500'}`}>+100€</span>
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                                isHomeVisit ? 'bg-cyan-500 border-cyan-500' : 'border-neutral-700 bg-neutral-900'
                                            }`}>
                                                {isHomeVisit && <Check className="w-3 h-3 text-black" />}
                                            </div>
                                        </div>
                                    </button>

                                    <div className="space-y-4">
                                        {isHomeVisit && (
                                            <div className="relative group animate-fade-in">
                                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600 group-focus-within:text-cyan-400 transition-colors" />
                                                <input 
                                                    required
                                                    minLength={10}
                                                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
                                                    placeholder="Adresse complète"
                                                    value={formData.address || ''}
                                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                                />
                                            </div>
                                        )}
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600 group-focus-within:text-cyan-400 transition-colors" />
                                            <input 
                                                required
                                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
                                                placeholder="Nom"
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600 group-focus-within:text-cyan-400 transition-colors" />
                                            <input 
                                                required
                                                type="email"
                                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
                                                placeholder="Email"
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex gap-2 relative z-20">
                                            <div className="relative w-36 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                                                    className="w-full h-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 text-white flex items-center justify-between hover:border-cyan-500/50 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-xl">{countries.find(c => c.code === formData.phonePrefix)?.flag}</span>
                                                        <span className="font-medium text-sm">{formData.phonePrefix}</span>
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isCountryOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                                                </button>
                                                
                                                {isCountryOpen && (
                                                    <div className="absolute bottom-full left-0 w-64 mb-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                                                        {countries.map((country) => (
                                                            <button
                                                                key={country.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({...formData, phonePrefix: country.code});
                                                                    setIsCountryOpen(false);
                                                                }}
                                                                className={`w-full px-4 py-3 text-left hover:bg-neutral-800 flex items-center gap-3 transition-colors border-b border-neutral-800/50 last:border-0 ${
                                                                    formData.phonePrefix === country.code ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-300'
                                                                }`}
                                                            >
                                                                <span className="text-xl">{country.flag}</span>
                                                                <span className="font-medium">{country.code}</span>
                                                                <span className="text-xs text-neutral-500 ml-auto">{country.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="relative group grow">
                                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600 group-focus-within:text-cyan-400 transition-colors" />
                                                <input 
                                                    required
                                                    type="tel"
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
                                                    placeholder="123 45 67 89"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setFormData({...formData, phone: val});
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitted}
                                    className={`w-full mt-8 py-4 px-6 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                                        isSubmitted 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.01] hover:shadow-cyan-500/20'
                                    }`}
                                >
                                    {isSubmitted ? <Check className="w-5 h-5" /> : "CONFIRMER LA RÉSERVATION"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Info & Vibe */}
            <div className="lg:w-2/5 flex flex-col gap-8">
                {/* Location Card */}
                <div className="group bg-neutral-900/10 border border-white/5 p-8 rounded-3xl transition-colors duration-500 hover:bg-neutral-900/30">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">LE LAB</h3>
                    <p className="text-neutral-500 leading-relaxed mb-6 text-sm">Là où la magie opère. Conçu pour la compression et la décompression.</p>
                    <div className="space-y-4 border-t border-neutral-800 pt-6">
                        <div className="flex items-start gap-3 text-sm font-medium text-neutral-300">
                             <MapPin className="w-4 h-4 text-cyan-500 mt-1" />
                             <span className="block font-mono">QG ONYX<br/>Quelque part en ville</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-neutral-300">
                             <Mail className="w-4 h-4 text-cyan-500" />
                             <span className="block font-mono tracking-wide">contact@onyx-lab.com</span>
                        </div>
                    </div>
                </div>

                {/* Hours Card */}
                <div className="bg-neutral-900/10 border border-white/5 p-8 grow flex flex-col rounded-3xl hover:bg-neutral-900/30 transition-colors">
                     <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">HORAIRES</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
                            <span className="text-neutral-500 text-sm uppercase font-bold tracking-widest">Lun</span>
                            <span className="text-[10px] font-bold bg-neutral-800 px-3 py-1 rounded-full text-neutral-400 border border-neutral-700">FERMÉ</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold text-sm uppercase tracking-widest">Mar — Dim</span>
                            <span className="text-cyan-500 font-bold">12:00 - 18:00</span>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-neutral-950 border-t border-cyan-500/10 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-cyan-950/20 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-6 flex flex-col items-center relative z-10">
          <div className="flex items-center gap-4 mb-8 text-white font-bold text-3xl tracking-tight">
             <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Scissors className="w-5 h-5 text-black" />
             </div>
             ONYX
          </div>
          
          <div className="flex gap-8 mb-12">
            {['Instagram', 'Phone', 'Mail'].map((icon, i) => (
                <a key={i} href="#" className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-400 transition-all rounded-full group">
                    {icon === 'Instagram' && <Instagram className="w-5 h-5" />}
                    {icon === 'Phone' && <Phone className="w-5 h-5" />}
                    {icon === 'Mail' && <Mail className="w-5 h-5" />}
                </a>
            ))}
          </div>
          
          <div className="text-center space-y-4">
              <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">
                Conçu pour l'Élite
              </p>
              <p className="text-neutral-700 text-xs">
                &copy; {new Date().getFullYear()} ONYX STUDIO. Tous droits réservés.
              </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
