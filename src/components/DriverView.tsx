import React, { useState } from 'react';
import MapView from './MapView';
import { useDemoStore, DEFAULT_CAMPUS_CENTER } from '../store/demo-store';
import { Power, MapPin, Navigation, Check, X, ShieldAlert, LogIn, Users, Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DriverView() {
  const { state, updateState, updateDriver, updateRide, resetState, addPastRide } = useDemoStore();
  
  // Local state for driver login session
  const [sessionDriverId, setSessionDriverId] = useState<string | null>(null);
  
  const [loginStep, setLoginStep] = useState<'select' | 'password'>('select');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const me = sessionDriverId ? state.drivers.find(d => d.id === sessionDriverId) : null;
  const isOnline = me?.status === 'online';

  // Driver actions
  const toggleStatus = () => {
    if (!me) return;
    updateDriver(me.id, { status: isOnline ? 'offline' : 'online' });
  };

  const attemptLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetedDriver = state.drivers.find(d => d.id === selectedDriverId);
    if (!targetedDriver) return;
    
    if (passwordInput === targetedDriver.password || passwordInput === '123') {
       setSessionDriverId(targetedDriver.id);
       setPasswordInput('');
       setLoginError('');
       setLoginStep('select');
    } else {
       setLoginError('Invalid password. Try 123');
    }
  }

  const handleAccept = () => {
    updateRide({ status: 'accepted' });
    updateDriver(me!.id, { status: 'busy' });

    setTimeout(() => {
      const current = JSON.parse(localStorage.getItem('ecoloop_demo_state_v4')||'{}');
      if (current?.ride?.status === 'accepted') {
         updateRide({ status: 'arriving' });
      }
    }, 2000);
  };

  const handleReject = () => {
    updateRide({ 
        status: 'searching', 
        assignedDriverId: null,
        rejectedBy: [...state.ride.rejectedBy, me!.id]
    });
  };

  const handleStartRide = () => {
    updateRide({ status: 'in_transit' });
  };

  const handleCompleteRide = () => {
    updateRide({ status: 'completed' });
    updateDriver(me!.id, { status: 'online' }); 
    
    // Add to history
    addPastRide({
       id: `R-${Math.floor(Math.random()*10000)}`,
       passengerId: state.ride.passengerId.split('@')[0],
       passengerName: state.ride.passengerName,
       driverId: me!.id,
       driverName: me!.name,
       pickupLocation: state.ride.pickupLocation,
       dropoffLocation: state.ride.dropoffLocation,
       date: new Date().toISOString(),
       fare: 1.5,
       rating: null
    });

    setTimeout(() => {
       resetState();
    }, 4000);
  };

  // If NO driver is logged into this tab yet, show the Login / Account selection screen
  if (!me) {
    return (
      <div className="flex h-full w-full bg-slate-100 flex-col items-center justify-center relative p-6">
        <div className="absolute inset-0 opacity-30 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-2xl p-8 max-w-lg w-full relative z-10 flex flex-col items-center min-h-[400px]">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300 mb-6">
               <Users size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Driver Terminal</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 text-center max-w-[300px]">
               {loginStep === 'select' ? 'Select a demo profile to link this terminal to the synchronized fleet.' : 'Enter driver credentials'}
            </p>

            {loginStep === 'select' ? (
              <div className="w-full space-y-3 overflow-y-auto max-h-[350px] pr-2">
                {state.drivers.filter(d => d.status !== 'suspended').map(driver => (
                  <button 
                    key={driver.id} 
                    onClick={() => { setSelectedDriverId(driver.id); setLoginStep('password') }}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-emerald-400 hover:bg-emerald-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-4">
                       <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${driver.name}`} className="w-10 h-10 border border-slate-200 bg-white rounded-full group-hover:border-emerald-300" alt="Avatar"/>
                       <div>
                          <p className="font-bold text-slate-800 text-sm">{driver.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{driver.id}  •  {driver.license}</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
               <form onSubmit={attemptLogin} className="w-full max-w-xs flex flex-col gap-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required
                      placeholder="Password (123)"
                      value={passwordInput}
                      onChange={(e) => {
                         setPasswordInput(e.target.value);
                         setLoginError('');
                      }}
                      className={`w-full bg-slate-50 border ${loginError ? 'border-red-300' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  {loginError && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">{loginError}</p>}
                  
                  <div className="flex gap-2 mt-4">
                     <button type="button" onClick={() => setLoginStep('select')} className="flex-1 py-3 text-xs uppercase font-bold tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Back</button>
                     <button type="submit" className="flex-[2] bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg uppercase tracking-widest text-xs transition-all">
                       Authenticate
                     </button>
                  </div>
               </form>
            )}
        </div>
      </div>
    );
  }

  // Active Terminal View
  const hasIncomingRequest = state.ride.status === 'pending_driver' && state.ride.assignedDriverId === me.id;
  const isMyActiveRide = ['accepted', 'arriving', 'in_transit'].includes(state.ride.status) && state.ride.assignedDriverId === me.id;
  const myCompletedRide = state.ride.status === 'completed' && state.ride.assignedDriverId === me.id;
  
  // Passenger historical data calculation
  const passengerHistoricalRides = state.pastRides.filter(r => r.passengerId === state.ride.passengerId.split('@')[0]);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-100 text-slate-900 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Sidebar UI */}
      <div className="w-full md:w-[380px] flex flex-col md:h-[95%] m-auto bg-white rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl z-10 flex-shrink-0 order-2 md:order-1 relative overflow-hidden">
        
        <div className="bg-slate-900 p-6 flex justify-between items-center rounded-t-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 overflow-hidden cursor-pointer" onClick={() => setSessionDriverId(null)}>
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${me.name}`} className="w-full h-full object-cover" alt="Driver" title="Click to log out"/>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{me.name}</p>
              <p className={`text-[10px] font-bold tracking-widest ${isOnline ? 'text-emerald-400' : me.status === 'busy' ? 'text-orange-400' : 'text-slate-500'}`}>
                {me.status.toUpperCase()}
              </p>
            </div>
          </div>
          
          <button 
            onClick={toggleStatus}
            disabled={me.status === 'busy'}
            className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors relative shadow-inner ${isOnline ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'} ${me.status === 'busy' ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ padding: '2px' }}
          >
            <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${isOnline ? 'bg-white' : 'bg-slate-400'}`}></div>
          </button>
        </div>

        <div className="p-6 bg-slate-50 flex-1 flex flex-col relative space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-between relative z-10">
             <div className="text-center flex-1 border-r border-slate-100 flex flex-col justify-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Today's Rides</p>
               <p className="text-xl font-black text-slate-800">14</p>
             </div>
             <div className="text-center flex-1 flex flex-col justify-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Earnings</p>
               <p className="text-xl font-black text-emerald-600">$12.40</p>
             </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            
            {me.status === 'offline' && !isMyActiveRide && !hasIncomingRequest && !myCompletedRide && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 bg-slate-50/90 backdrop-blur-sm rounded-xl">
                <ShieldAlert className="text-slate-400 mb-4" size={48} />
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">You are offline</h3>
                <p className="text-xs font-medium text-slate-500 max-w-[200px]">Toggle your status to online to start receiving direct dispatch requests.</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              
              {isOnline && !hasIncomingRequest && !isMyActiveRide && !myCompletedRide && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center pb-12"
                >
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md animate-bounce">
                      <Navigation size={24} />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Listening for Dispatch...</h3>
                    <p className="text-xs font-medium text-slate-500 mt-2 max-w-[200px]">Your terminal is connected and active. Please wait.</p>
                </motion.div>
              )}

              {hasIncomingRequest && (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 shadow-lg flex flex-col shadow-emerald-100 animate-pulse-slow relative z-30"
                >
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[10px] bg-emerald-500 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">New Ride Offer</span>
                     <span className="text-xs font-black text-emerald-700">Immediate</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-emerald-100 mb-6 space-y-2 relative">
                    <div className="border-b border-slate-100 pb-2 mb-2 flex justify-between items-center">
                       <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Passenger: <span className="text-slate-800">{state.ride.passengerName}</span></p>
                       <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-blue-100">{passengerHistoricalRides.length} Past Rides</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border-dashed border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Pickup Location</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700 uppercase">{state.ride.pickupLocation}</p>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Dropoff Location</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700 uppercase">{state.ride.dropoffLocation}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={handleReject}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={handleAccept}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-200 transition-all"
                    >
                      Accept Book
                    </button>
                  </div>
                </motion.div>
              )}

              {isMyActiveRide && state.ride.status !== 'in_transit' && (
                 <motion.div
                 key="arriving"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex-1 flex flex-col"
               >
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Proceed to Pickup</h3>
                 <p className="text-2xl font-black text-slate-800 mb-6">{state.ride.passengerName}</p>
                 
                 <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 mb-4 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-2">Pickup Location Address</p>
                    <h4 className="font-bold text-lg text-slate-800 pl-2">{state.ride.pickupLocation}</h4>
                 </div>
                 
                 <button 
                   onClick={handleStartRide}
                   className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 uppercase tracking-widest text-[11px] transition-all"
                 >
                   Confirm Passenger & Start
                 </button>
               </motion.div>
              )}

              {isMyActiveRide && state.ride.status === 'in_transit' && (
                 <motion.div
                 key="transit"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex-1 flex flex-col"
               >
                 <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-emerald-700 font-bold uppercase tracking-widest text-[10px]">Ride In Progress</span>
                 </div>

                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Destination / Dropoff</h3>
                 <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-auto">
                   <p className="text-xl font-black text-slate-800">{state.ride.dropoffLocation}</p>
                   <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fare (Card)</p>
                        <p className="font-black text-slate-800 text-lg">$2.50</p>
                      </div>
                   </div>
                 </div>
                 
                 <button 
                   onClick={handleCompleteRide}
                   className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-200 uppercase tracking-widest text-[11px] transition-all"
                 >
                   Complete Ride
                 </button>
               </motion.div>
              )}

              {myCompletedRide && (
                <motion.div
                  key="completed_drv"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Success</h3>
                  <p className="text-sm font-bold text-emerald-600 mb-8">+ $2.50 added</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Waiting for next dispatch...</p>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Map UI */}
      <div className="flex-1 h-[400px] md:h-full relative order-1 md:order-2 z-0 pb-16 md:pb-0 px-4 pt-4">
        <MapView 
          passengerLocation={isMyActiveRide ? state.passengerCoords : null} 
          drivers={state.drivers}
          focusCenter={me.location}
          route={isMyActiveRide && state.passengerCoords ? [me.location, state.passengerCoords] : undefined}
        />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[1000] pointer-events-none">
           <div className="bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-700 text-[10px] leading-tight font-bold text-white uppercase tracking-widest whitespace-nowrap">
             Driver Terminal Active [{me.id}]
           </div>
        </div>
      </div>
    </div>
  );
}
