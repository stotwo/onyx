'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Trash2, Lock, LogOut } from 'lucide-react';

interface Booking {
  id: number;
  clientName: string;
  clientPhone: string;
  service: string;
  price: number;
  date: string;
  time: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const loadBookings = async () => {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .order('booking_date', { ascending: true })
          .order('booking_time', { ascending: true });

        if (data) {
          const formatted = data.map((b) => ({
            id: b.id,
            clientName: b.client_name,
            clientPhone: b.client_phone,
            service: b.service_name,
            price: b.service_price,
            date: b.booking_date,
            time: b.booking_time
          }));
          setBookings(formatted);
        }
      };
      loadBookings();
    }
  }, [isAuthenticated, refreshKey]);



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mot de passe simple pour l'exemple
    if (password === 'ONYX2026') {
      setIsAuthenticated(true);
    } else {
      alert('Code d\'accès incorrect');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Voulez-vous vraiment annuler ce rendez-vous et libérer le créneau ?')) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      
      if (!error) {
         setRefreshKey(prev => prev + 1);
      } else {
         alert("Erreur: " + error.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <form onSubmit={handleLogin} className="w-full max-w-sm p-8 border border-white/10 bg-white/5 backdrop-blur-md text-center">
            <Lock className="w-8 h-8 mx-auto mb-6 text-white" />
            <h1 className="text-xl font-serif mb-6">ONYX ADMIN.</h1>
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Code d'accès"
                className="w-full bg-black/50 border border-white/20 p-3 text-center text-white mb-4 focus:border-white outline-none font-serif tracking-widest"
            />
            <button type="submit" className="w-full bg-white text-black py-3 font-bold uppercase text-xs tracking-widest hover:bg-neutral-200">
                Entrer
            </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-serif text-white">Tableau de Bord <span className="text-xs bg-green-900/30 text-green-500 px-2 py-1 rounded ml-2 border border-green-500/20 font-sans tracking-normal">Mode Connecté</span></h1>
                <p className="text-neutral-500 text-sm mt-1">Gestion des rendez-vous clients (Synchronisé en temps réel)</p>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-white text-neutral-500">
                <LogOut className="w-4 h-4" /> Quitter
            </button>
        </div>

        {bookings.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                <Calendar className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">Aucun rendez-vous planifié pour le moment.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white/5 border border-white/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-colors group">
                        <div className="flex gap-6 items-center">
                            <div className="text-center min-w-16">
                                <span className="block text-2xl font-serif text-white">{new Date(booking.date).getDate()}</span>
                                <span className="block text-xs uppercase text-neutral-500">{new Date(booking.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-serif text-white flex items-center gap-3">
                                    {booking.time} 
                                    <span className="text-xs font-sans font-normal text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Confirmé</span>
                                </h3>
                                <p className="text-neutral-300 font-medium mt-1">{booking.clientName}</p>
                                <div className="flex gap-4 text-xs text-neutral-500 mt-2">
                                    <span>{booking.service}</span>
                                    <span>•</span>
                                    <span>{booking.price}€</span>
                                    <span>•</span>
                                    <span>{booking.clientPhone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto justify-end">
                            <button 
                                onClick={() => handleDelete(booking.id)}
                                className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-full"
                                title="Annuler le RDV"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
