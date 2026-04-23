import React, { useState } from 'react';
import PassengerView from './components/PassengerView';
import DriverView from './components/DriverView';
import AdminView from './components/AdminView';
import { User, Car, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Role = 'passenger' | 'driver' | 'admin' | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(true);

  if (!showRoleSelector && role) {
    return (
      <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100 text-slate-900 font-sans">
        <div className="h-12 bg-slate-900 text-slate-100 flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-widest shrink-0 shadow-md relative z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Demo Mode Active: {role.charAt(0).toUpperCase() + role.slice(1)} View
          </div>
          <button 
            onClick={() => {
              setShowRoleSelector(true);
            }}
            className="hover:text-emerald-400 transition-colors"
          >
            ← Switch Role
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
           {role === 'passenger' && <PassengerView />}
           {role === 'driver' && <DriverView />}
           {role === 'admin' && <AdminView />}
        </div>
      </div>
    );
  }

  const handleSelectRole = (selected: Role) => {
    setRole(selected);
    setShowRoleSelector(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <AnimatePresence>
      {showRoleSelector && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          className="max-w-4xl w-full relative z-10"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-800">EcoLoop Campus Prototype</h1>
            <p className="text-sm font-medium text-slate-500 max-w-2xl mx-auto">
              Select a portal to explore the investor demo. For the best experience, open this link in two separate windows side-by-side to see real-time interaction between Passenger and Driver.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <RoleCard 
              title="Passenger App"
              description="Book rides, track rickshaws on campus, and view driver details in real-time."
              icon={<User size={32} className="text-blue-600" />}
              onClick={() => handleSelectRole('passenger')}
              color="border-slate-200 bg-white hover:border-blue-300 shadow-xl"
              buttonClass="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px]"
            />
            <RoleCard 
              title="Driver Portal"
              description="Accept requests, toggle online status, and navigate to passengers."
              icon={<Car size={32} className="text-emerald-600" />}
              onClick={() => handleSelectRole('driver')}
              color="border-slate-200 bg-white hover:border-emerald-300 shadow-xl"
              buttonClass="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]"
            />
            <RoleCard 
              title="Admin Dashboard"
              description="Monitor system metrics, manage driver accounts, and track ride demand."
              icon={<Shield size={32} className="text-slate-700" />}
              onClick={() => handleSelectRole('admin')}
              color="border-slate-200 bg-white hover:border-slate-400 shadow-xl"
              buttonClass="bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-200 uppercase tracking-widest text-[10px]"
            />
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function RoleCard({ title, description, icon, onClick, color, buttonClass }: any) {
  return (
    <div 
      className={`border-[4px] rounded-3xl p-6 cursor-pointer transition-all duration-300 ${color} flex flex-col h-full hover:-translate-y-2 group`}
      onClick={onClick}
    >
      <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2 text-slate-800">{title}</h2>
      <p className="text-slate-500 text-xs font-medium leading-relaxed flex-1 mb-6">{description}</p>
      <button className={`w-full py-3 px-4 rounded-xl font-bold transition-colors mt-auto ${buttonClass}`}>
        Launch Demo
      </button>
    </div>
  );
}
