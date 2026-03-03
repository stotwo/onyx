/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Check, Instagram, ArrowLeft, Mail, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Home() {
  const [bookingStep, setBookingStep] = useState(0); 
  const [selectedService, setSelectedService] = useState<{name: string, price: number, duration: string, desc: string} | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  // Chargement des RDV depuis Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (data) {
        // Adaptateur pour matcher le format attendu par le front (si besoin)
        // Le front utilise b.dateStr et b.time, b.durationMin
        // La DB renvoie b.booking_date, b.booking_time, b.duration_min
        // On va mapper pour simplifier la vie
        const formatted = data.map(b => ({
            ...b,
            dateStr: b.booking_date,
            time: b.booking_time,
            durationMin: b.duration_min || b.service_duration_min,
            service: b.service_name
        }));
        setBookedSlots(formatted);
      }
    };

    fetchBookings();
    
    // Souscription aux changements temps réel (Optionnel mais cool)
    const subscription = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Services - Simple & Pro
  const services = [
    { name: "La Coupe Signature", price: 35, duration: "45 min", desc: "Consultation, shampoing, coupe structurée, coiffage." },
    { name: "Taille de Barbe", price: 25, duration: "30 min", desc: "Tracé précis, rasage traditionnel, soin hydratant." },
    { name: "Le Rituel Complet", price: 55, duration: "1h 15", desc: "L'expérience totale : coupe et barbe avec soin visage express." }
  ];

  // Dates handling
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Add empty slots for days before the first of the month
    // Sunday is 0, Monday is 1... adjusting so Monday is first
    let startDay = firstDay.getDay(); 
    if (startDay === 0) startDay = 7; // Sunday becomes 7
    
    for (let i = 1; i < startDay; i++) {
        days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prev);
  };

  // Simple formatting
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  };
  
  // Formatage pour comparaison
  const formatApiDate = (date: Date) => date.toISOString().split('T')[0];

  // Créneaux toutes les 15 min pour maximiser l'efficacité (0 temps mort)
  // Matin: 10h - 12h45 (Fin max 13h) | Aprèm: 14h - 19h
  const timeSlots = [
    // Matin
    "10:00", "10:15", "10:30", "10:45", 
    "11:00", "11:15", "11:30", "11:45", 
    "12:00", "12:15", "12:30", "12:45",
    
    // Après-midi
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45", 
    "17:00", "17:15", "17:30", "17:45", 
    "18:00", "18:15", "18:30", "18:45", "19:00"
  ];

  // Helper pour convertir les durées (ex: "1h 15" -> 75 min)
  const parseDuration = (str: string) => {
    if (str.includes('h')) {
      const [h, m] = str.split('h').map(s => parseInt(s.trim()) || 0);
      return h * 60 + m;
    }
    return parseInt(str);
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Simulate server delay + Validation
    // Actually no need for timeout with async call, but nice for UX feedback
    
    const durationMin = selectedService ? parseDuration(selectedService.duration) : 30;

    if (!selectedDate || !selectedTime) return;

    // Create new booking object for Supabase
    const newBooking = {
      client_name: formData.name,
      client_phone: formData.phone,
      client_email: formData.email,
      service_name: selectedService?.name,
      service_price: selectedService?.price,
      service_duration: selectedService?.duration,
      duration_min: durationMin, // Correction: match the SQL schema (duration_min)
      booking_date: formatApiDate(selectedDate),
      booking_time: selectedTime,
      status: 'confirmed'
    };

    const { error } = await supabase
      .from('bookings')
      .insert([newBooking]);

    if (error) {
      alert("Erreur lors de la réservation : " + error.message);
      setIsSubmitted(false);
      return;
    }

    // Le useEffect avec la subscription va mettre à jour le state automatiquement
    // Mais on peut reset le form tout de suite
    setIsSubmitted(false);
    setBookingStep(0);
    setFormData({ name: '', phone: '', email: '' });
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    alert("Réservation confirmée. Votre créneau est sécurisé."); 
  };

  // Check availability with OVERLAP logic
  const isSlotTaken = (date: Date, time: string) => {
    // 1. Check if in the past
    // NOTE: We do this check first because it's cheap
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    if (slotDate < now) return true;

    // 2. Check overlap with existing bookings
    const dateStr = formatApiDate(date);
    const dayBookings = bookedSlots.filter((b: any) => b.dateStr === dateStr);
    
    if (dayBookings.length === 0) return false;

    // Current slot we want to check/book
    const currentStart = timeToMinutes(time);
    // If we have a selected service, use its duration. 
    // If not (e.g. browsing calendar), assume standard slot check (30 min or just point in time?)
    // But wait, isDayFull calls this without a specific intended booking time? 
    // Actually when isDayFull matches, selectedService IS set because we are in Step 1.
    // If selectedService is null (shouldn't happen in booking flow), default to 30.
    const currentDuration = selectedService ? parseDuration(selectedService.duration) : 30; 
    const currentEnd = currentStart + currentDuration;

    return dayBookings.some((b: any) => {
        const bStart = timeToMinutes(b.time);
        
        // Retrieve duration from booking object OR lookup service list if missing (for old data)
        let bDuration = b.durationMin;
        if (!bDuration) {
             const s = services.find(s => s.name === b.service);
             bDuration = s ? parseDuration(s.duration) : 30;
        }

        const bEnd = bStart + bDuration;

        // Overlap condition:
        // [currentStart, currentEnd] overlaps [bStart, bEnd]
        // This is true if currentStart < bEnd AND currentEnd > bStart
        return (currentStart < bEnd && currentEnd > bStart);
    });
  };

  const isDayFull = (date: Date) => {
    return timeSlots.every(time => isSlotTaken(date, time));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-white selection:text-black">
      
      {/* HEADER MINIMALISTE */}
      <nav className="fixed w-full z-50 top-0 left-0 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <a href="#" className="text-2xl font-serif tracking-tighter font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">ONYX.</a>
        <a href="#reservation" className="text-xs uppercase tracking-[0.2em] hover:text-white/70 transition-colors border-b border-transparent hover:border-white/70 pb-1">
          Prendre Rendez-vous
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col justify-center px-8 md:px-24 pt-20">
        <div className="max-w-4xl z-10 animate-fade-in">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-neutral-500 mb-6">Est. 2026 — Paris</p>
            <h1 className="text-5xl md:text-8xl font-serif font-medium leading-[1.1] text-white mb-8">
              L'art du détail.<br />
              <span className="text-neutral-500">L'élégance du geste.</span>
            </h1>
            <p className="max-w-md text-neutral-400 font-light leading-relaxed mb-12">
              ONYX est un espace dédié à l'homme moderne. Plus qu'une coupe, nous proposons une architecture capillaire adaptée à votre morphologie et votre style de vie.
            </p>
            
            <a href="#reservation" className="inline-block bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
              Réserver votre siège
            </a>
        </div>

        {/* Image d'ambiance sombre et subtile en fond */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-0 opacity-20 md:opacity-40 pointer-events-none">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1503951914875-befea7470dac?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale mask-image-linear-to-l"></div>
            <div className="absolute inset-0 bg-linear-to-r from-[#050505] via-[#050505]/50 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-pulse">
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-3 h-3" />
        </div>
      </section>

      {/* SECTION PHILOSOPHIE / IMAGES */}
      <section className="py-24 px-8 md:px-24 bg-[#050505]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                  <h2 className="text-3xl font-serif text-white">Précision & Maîtrise</h2>
                  <p className="text-neutral-400 font-light leading-7">
                      Chaque client est unique. Notre approche combine les techniques traditionnelles du barbier avec une vision contemporaine du style. Nous prenons le temps d'analyser, de conseiller et d'exécuter avec une précision chirurgicale.
                  </p>
                  <ul className="space-y-4 pt-4 border-t border-white/10">
                      <li className="flex items-center gap-4 text-sm text-neutral-300">
                          <Check className="w-4 h-4 text-white" /> Produits haut de gamme
                      </li>
                      <li className="flex items-center gap-4 text-sm text-neutral-300">
                          <Check className="w-4 h-4 text-white" /> Consultation personnalisée
                      </li>
                      <li className="flex items-center gap-4 text-sm text-neutral-300">
                          <Check className="w-4 h-4 text-white" /> Cadre privé et exclusif
                      </li>
                  </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop" alt="Barber detail" className="w-full aspect-3/4 object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop" alt="Barber shop" className="w-full aspect-3/4 object-cover grayscale hover:grayscale-0 transition-all duration-700 mt-12" />
              </div>
          </div>
      </section>

      {/* MODULE DE RESERVATION PRO */}
      <section id="reservation" className="scroll-mt-32 py-12 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Rendez-vous</span>
                <h2 className="text-4xl font-serif text-white mt-4">Votre créneau</h2>
            </div>

            <div className="bg-[#050505] border border-white/10 p-8 md:p-10 shadow-2xl">
                {/* STEP INDICATOR */}
                <div className="flex items-center justify-between md:justify-start md:gap-8 mb-10 text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/5 pb-6">
                    <span className={bookingStep >= 0 ? "text-white" : ""}>01. Service</span>
                    <span className={bookingStep >= 1 ? "text-white" : ""}>02. Date</span>
                    <span className={bookingStep >= 2 ? "text-white" : ""}>03. Info</span>
                </div>

                {/* CONTENT */}
                <div className="min-h-75">
                    {bookingStep === 0 && (
                        <div className="space-y-4 animate-fade-in">
                            {services.map((s, i) => (
                                <button 
                                    key={i}
                                    onClick={() => { setSelectedService(s); setBookingStep(1); }}
                                    className="w-full text-left p-6 border border-white/5 hover:border-white/30 hover:bg-white/5 transition-all group flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="text-lg font-serif text-white mb-1 group-hover:pl-2 transition-all">{s.name}</h3>
                                        <p className="text-sm text-neutral-500">{s.desc}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <div className="text-lg text-white font-medium">{s.price}€</div>
                                        <div className="text-xs text-neutral-500">{s.duration}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {bookingStep === 1 && (
                        <div className="animate-fade-in">
                            <button onClick={() => setBookingStep(0)} className="mb-6 text-xs flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
                                <ArrowLeft className="w-3 h-3" /> Retour
                            </button>
                            
                            {!selectedDate ? (
                                <div className="max-w-md mx-auto">
                                    <div className="flex justify-between items-center mb-6 px-2">
                                        <button 
                                            onClick={prevMonth} 
                                            disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-white" />
                                        </button>
                                        <h3 className="text-white font-serif uppercase tracking-widest">
                                            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <button 
                                            onClick={nextMonth}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-white" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(d => (
                                            <span key={d} className="text-[10px] text-neutral-600 uppercase font-medium">{d}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((d: any, i) => {
                                        if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
                                        
                                        const now = new Date();
                                        now.setHours(0,0,0,0);
                                        const isPast = d < now;
                                        const isSunday = d.getDay() === 0;
                                        
                                        // For full check, we need to respect the day
                                        const isFull = !isPast && !isSunday && isDayFull(d);
                                        const isDisabled = isPast || isSunday || isFull;

                                        const isToday = d.toDateString() === new Date().toDateString();

                                        return (
                                        <button 
                                            key={i}
                                            onClick={() => setSelectedDate(d)}
                                            disabled={isDisabled} 
                                            className={`aspect-square flex items-center justify-center text-sm font-serif transition-all relative group ${
                                                isDisabled 
                                                ? 'text-neutral-700 cursor-not-allowed' 
                                                : isToday 
                                                    ? 'bg-white text-black font-bold' 
                                                    : 'text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {isFull && !isSunday && !isPast && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-[80%] h-[1px] bg-red-500/50 transform -rotate-45"></div>
                                                </div>
                                            )}
                                            {d.getDate()}
                                        </button>
                                    )})}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-white font-serif text-lg mb-4 text-center capitalize">{formatDate(selectedDate)}</h4>
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {timeSlots.map(t => {
                                            const taken = isSlotTaken(selectedDate, t);
                                            return (
                                            <button
                                                key={t}
                                                disabled={taken}
                                                onClick={() => { setSelectedTime(t); setBookingStep(2); }}
                                                className={`py-2 border transition-all text-xs font-medium relative ${
                                                    taken 
                                                    ? 'border-white/5 bg-white/5 text-neutral-600 cursor-not-allowed line-through decoration-white/20' 
                                                    : 'border-white/10 hover:bg-white hover:text-black hover:border-white text-white'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        )})}
                                    </div>
                                    <button onClick={() => setSelectedDate(null)} className="w-full mt-6 text-xs text-neutral-500 underline decoration-neutral-700 underline-offset-4">Changer de jour</button>
                                </div>
                            )}
                        </div>
                    )}

                    {bookingStep === 2 && (
                        <form onSubmit={handleBookingSubmit} className="animate-fade-in">
                             <button type="button" onClick={() => {
                                 setBookingStep(1); 
                                 // Reset time if going back to date selection? No, keep it.
                                 if (!selectedDate) setBookingStep(0);
                             }} className="mb-6 text-xs flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
                                <ArrowLeft className="w-3 h-3" /> Retour
                            </button>

                            <div className="mb-8 p-4 bg-white/5 border border-white/5 flex justify-between items-center text-sm">
                                <div>
                                    <span className="block text-white font-serif">{selectedService?.name}</span>
                                    <span className="text-neutral-500 capitalize">{selectedDate && formatDate(selectedDate)} à {selectedTime}</span>
                                </div>
                                <span className="text-xl text-white">{selectedService?.price}€</span>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 block">Nom Complet</label>
                                    <input 
                                        required 
                                        type="text" 
                                        className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:border-white focus:outline-none transition-colors rounded-none placeholder:text-neutral-800 font-serif text-xl" 
                                        placeholder="Votre Nom"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 block">Téléphone</label>
                                    <input 
                                        required 
                                        type="tel" 
                                        className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:border-white focus:outline-none transition-colors rounded-none placeholder:text-neutral-800 font-serif text-xl" 
                                        placeholder="06 00 00 00 00"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 block">Email</label>
                                    <input 
                                        required 
                                        type="email" 
                                        className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:border-white focus:outline-none transition-colors rounded-none placeholder:text-neutral-800 font-serif text-xl" 
                                        placeholder="email@exemple.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 mt-12 hover:bg-neutral-200 transition-colors">
                                {isSubmitted ? "Confirmé" : "Confirmer le rendez-vous"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#050505] text-center">
            <h2 className="text-2xl font-serif text-white mb-6">ONYX.</h2>
            <div className="flex justify-center gap-8 mb-8">
                <a href="#" className="text-neutral-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="text-neutral-500 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
            <div className="text-xs text-neutral-600 uppercase tracking-widest space-y-2">
                <p>12 Rue du Style, 75000 Paris</p>
                <p>&copy; 2026 Onyx Lab. All rights reserved.</p>
            </div>
      </footer>
    </div>
  );
}
