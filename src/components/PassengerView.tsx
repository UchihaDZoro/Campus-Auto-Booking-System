import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import { useDemoStore, DEFAULT_CAMPUS_CENTER, Driver } from '../store/demo-store';
import { Search, MapPin, Navigation, Clock, Star, ShieldCheck, Mail, LogIn, CheckCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PassengerView() {
  const { state, updateState, updateRide, initializeLocation, resetState, updatePastRideRating } = useDemoStore();
  
  // Passenger session
  const passengerEmail = state.ride.passengerId; // using ride state to hold current user for now
  
  const [loginEmail, setLoginEmail] = useState('23je0699@iitism.ac.in');
  const [loginError, setLoginError] = useState('');

  // Map state
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [selectingLocationFor, setSelectingLocationFor] = useState<'pickup' | 'dropoff' | null>(null);

  const [pickupText, setPickupText] = useState('Select on Map \u2192');
  const [dropoffText, setDropoffText] = useState('Select on Map \u2192');
  
  const [noDriversMsg, setNoDriversMsg] = useState(false);
  const [showRidesPanel, setShowRidesPanel] = useState(false);

  // Automatically find real location on mount
  useEffect(() => {
    if (!state.systemReady && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          initializeLocation([pos.coords.latitude, pos.coords.longitude]);
          setPickupCoords([pos.coords.latitude, pos.coords.longitude]);
          setPickupText('Current Location');
        },
        (err) => {
          console.warn("Location error, using fallback. Error:", err);
          initializeLocation(DEFAULT_CAMPUS_CENTER);
        }
      );
    }
  }, [state.systemReady, initializeLocation]);

  const passengerLoc = pickupCoords || state.passengerCoords || DEFAULT_CAMPUS_CENTER;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.endsWith('@iitism.ac.in')) {
      setLoginError('Must use valid @iitism.ac.in campus mail');
      return;
    }
    const admissionNo = loginEmail.split('@')[0];
    let name = 'Student';
    if (loginEmail === '23je0699@iitism.ac.in') name = 'Pathan Gulamgaush';
    
    updateRide({
      passengerId: loginEmail,
      passengerName: name,
    });
  };

  const handleMapClick = (coords: [number, number]) => {
     if (selectingLocationFor === 'pickup') {
       setPickupCoords(coords);
       setPickupText(`Map (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
       setSelectingLocationFor(null);
     } else if (selectingLocationFor === 'dropoff') {
       setDropoffCoords(coords);
       setDropoffText(`Map (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
       setSelectingLocationFor(null);
     }
  };

  // The driver assignment logic loop
  useEffect(() => {
    if (state.ride.status === 'searching') {
      const timer = setTimeout(() => {
        const availableDrivers = state.drivers.filter(
          (d) => d.status === 'online' && !state.ride.rejectedBy.includes(d.id)
        );

        if (availableDrivers.length > 0) {
          // Find nearest
          let nearestDriver = availableDrivers[0];
          let minDistance = Infinity;

          availableDrivers.forEach(d => {
             const dist = Math.hypot(d.location[0] - passengerLoc[0], d.location[1] - passengerLoc[1]);
             if (dist < minDistance) {
               minDistance = dist;
               nearestDriver = d;
             }
          });

          updateRide({ 
            status: 'pending_driver', 
            assignedDriverId: nearestDriver.id 
          });
          setNoDriversMsg(false);

        } else {
          setNoDriversMsg(true);
          updateRide({ status: 'idle' });
        }
      }, 1500); 

      return () => clearTimeout(timer);
    }
  }, [state.ride.status, state.drivers, state.ride.rejectedBy, passengerLoc, updateRide]);


  const handleRequestRide = () => {
    if (!pickupCoords || !dropoffCoords) {
       alert("Please drop both pickup and dropoff markers on the map.");
       return;
    }
    updateRide({ 
      status: 'searching', 
      pickupLocation: pickupText, 
      dropoffLocation: dropoffText,
      pickupCoords,
      dropoffCoords,
      rejectedBy: []
    });
  };

  const handleCancel = () => {
    resetState();
    setNoDriversMsg(false);
  };

  // Login Screen
  if (!passengerEmail) {
     return (
      <div className="flex h-full w-full bg-slate-100 flex-col items-center justify-center relative p-6">
        <div className="absolute inset-0 opacity-30 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-2xl p-8 max-w-sm w-full relative z-10">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6 mx-auto">
               <User size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center mb-2">Student Portal</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 text-center">Login via Campus Mail</p>

            <form onSubmit={handleLogin} className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Campus Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={loginEmail}
                      onChange={(e) => {
                         setLoginEmail(e.target.value);
                         setLoginError('');
                      }}
                      className={`w-full bg-slate-50 border ${loginError ? 'border-red-300' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  {loginError && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-2">{loginError}</p>}
               </div>
               <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Authenticate
                </button>
            </form>
        </div>
      </div>
     )
  }

  const assignedInfo = state.ride.assignedDriverId 
    ? state.drivers.find(d => d.id === state.ride.assignedDriverId) 
    : null;

  const myPastRides = state.pastRides.filter(r => r.passengerId === passengerEmail.split('@')[0]);
  const unratedRide = myPastRides.find(r => r.rating === null);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-100 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Sidebar UI */}
      <div className="w-full md:w-[400px] flex flex-col md:h-[95%] m-auto bg-white rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl z-10 p-6 flex-shrink-0 order-2 md:order-1 relative overflow-hidden">
        
        <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 flex justify-center z-50">
          <div className="w-20 h-4 bg-slate-800 rounded-b-xl border-t border-slate-800 shadow-inner"></div>
        </div>

        <div className="flex items-center justify-between mb-6 mt-4 shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 cursor-pointer" onClick={() => updateRide({ passengerId: '' })}>
                <User className="w-5 h-5 text-white" />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-slate-800">EcoLoop</h2>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{state.ride.passengerName}</p>
             </div>
           </div>
           
           <button onClick={() => setShowRidesPanel(!showRidesPanel)} className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-slate-200">
             {showRidesPanel ? 'Back' : 'History'}
           </button>
        </div>

        {showRidesPanel ? (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Past Rides</h3>
             {myPastRides.length === 0 && <p className="text-sm font-medium text-slate-400">No past rides.</p>}
             {myPastRides.map(r => (
               <div key={r.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-black text-slate-800">{new Date(r.date).toLocaleDateString()}</span>
                     <span className="text-xs font-bold text-emerald-600">${r.fare.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Driver: {r.driverName}</div>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                     <span>{r.pickupLocation}</span>
                     <span>&rarr;</span>
                     <span>{r.dropoffLocation}</span>
                  </div>

                  {r.rating === null ? (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                       <p className="text-[10px] uppercase font-bold text-slate-600 mb-2">Rate this ride</p>
                       <div className="flex gap-1">
                         {[1,2,3,4,5].map(star => (
                            <Star key={star} onClick={() => updatePastRideRating(r.id, star)} className="text-slate-300 hover:text-orange-400 cursor-pointer transition-colors" size={20} />
                         ))}
                       </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1">
                      <Star size={12} className="text-orange-500 fill-orange-500" />
                      <span className="text-[10px] font-bold text-slate-500">{r.rating} Rated</span>
                    </div>
                  )}
               </div>
             ))}
          </div>
        ) : (
        <>
          {unratedRide && state.ride.status === 'idle' && (
             <div className="mb-4 bg-orange-50 border border-orange-200 p-3 rounded-xl shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-orange-800 mb-2 flex items-center gap-1"><Star size={12}/> Rate Past Ride</p>
                <p className="text-xs text-orange-700 font-medium mb-2">How was your ride with {unratedRide.driverName}?</p>
                <div className="flex gap-1 justify-center">
                   {[1,2,3,4,5].map(star => (
                      <Star key={star} onClick={() => updatePastRideRating(unratedRide.id, star)} className="text-orange-300 hover:text-orange-500 cursor-pointer transition-colors" size={24} />
                   ))}
                </div>
             </div>
          )}

          {noDriversMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg font-medium shadow-sm animate-pulse">
              No drivers available! They might be busy or offline.
            </div>
          )}

          <AnimatePresence mode="wait">
            {state.ride.status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col pt-2"
              >
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Where to?</h3>
                
                <div className="space-y-4 mb-6 relative">
                  <div className="absolute left-4 top-5 bottom-8 w-0.5 bg-slate-200 z-0"></div>
                  <div className="relative z-10 -ml-1">
                    <button 
                      onClick={() => setSelectingLocationFor('pickup')}
                      className={`flex items-center gap-3 w-full bg-white border ${selectingLocationFor === 'pickup' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'} rounded-xl px-4 py-3 text-left transition-all`}
                    >
                      <div className="w-3 h-3 bg-emerald-500 rounded-full ml-1.5 ring-4 ring-white flex-shrink-0"></div>
                      <span className={`text-sm font-bold truncate ${pickupCoords ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                        {pickupText}
                      </span>
                    </button>
                  </div>
                  
                  <div className="relative z-10 -ml-1">
                    <button 
                       onClick={() => setSelectingLocationFor('dropoff')}
                       className={`flex items-center gap-3 w-full bg-white border ${selectingLocationFor === 'dropoff' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'} rounded-xl px-4 py-3 text-left transition-all`}
                    >
                      <div className="w-3 h-3 bg-blue-500 rounded-full ml-1.5 ring-4 ring-white flex-shrink-0"></div>
                      <span className={`text-sm font-bold truncate ${dropoffCoords ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                        {dropoffText}
                      </span>
                    </button>
                  </div>
                </div>

                {selectingLocationFor && (
                  <div className="bg-slate-800 text-white rounded-xl p-3 mb-6 text-xs text-center font-bold tracking-wide shadow-lg border border-slate-700 animate-pulse">
                    Please tap on the map to set {selectingLocationFor} location!
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-4 mb-auto border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
                      <Navigation size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-800">Campus Rickshaw</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available now</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600">$1.50</span>
                </div>

                <button 
                  onClick={handleRequestRide}
                  disabled={!pickupCoords || !dropoffCoords || !!selectingLocationFor}
                  className="w-full mt-4 bg-emerald-600 disabled:bg-slate-300 disabled:shadow-none hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px] transition-all"
                >
                  Book Nearest Ride
                </button>
              </motion.div>
            )}

            {state.ride.status === 'searching' && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-10"
              >
                <div className="w-20 h-20 mb-6 relative">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                    <Search size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-800 mb-2">Analyzing Fleet</h3>
                <p className="text-xs font-medium text-slate-500 max-w-[250px]">Finding nearest drivers for your location...</p>
                
                <button 
                  onClick={handleCancel}
                  className="mt-8 px-6 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors text-[10px] uppercase font-bold tracking-widest"
                >
                  Cancel Search
                </button>
              </motion.div>
            )}

            {state.ride.status === 'pending_driver' && assignedInfo && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-6"
              >
                 <div className="w-20 h-20 mb-6 rounded-full border-4 border-slate-100 overflow-hidden relative shadow-lg">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${assignedInfo.name}`} className="w-full h-full object-cover" alt="Driver" />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-50"></div>
                 </div>
                 
                 <h3 className="text-lg font-black tracking-tight text-slate-800 mb-1">Waiting for {assignedInfo.name.split(' ')[0]}</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 border bg-slate-50 px-3 py-1 rounded-full">{assignedInfo.license} • {assignedInfo.rating.toFixed(1)} ★</p>

                 <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-left mb-auto">
                   <p className="text-xs font-bold text-slate-600">Driver Notification Sent</p>
                   <p className="text-xs text-slate-500 mt-1">Waiting for driver to accept from their terminal.</p>
                   <div className="w-full h-1 bg-slate-200 rounded-full mt-3 overflow-hidden">
                      <div className="w-1/3 h-full bg-blue-500 rounded-full animate-[bounce_2s_infinite]"></div>
                   </div>
                 </div>
                
                <button 
                  onClick={handleCancel}
                  className="mt-4 px-6 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors text-[10px] uppercase font-bold tracking-widest"
                >
                  Cancel Request
                </button>
              </motion.div>
            )}

            {(state.ride.status === 'accepted' || state.ride.status === 'arriving' || state.ride.status === 'in_transit') && assignedInfo && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col"
              >
                <div className="bg-orange-50 text-orange-700 border border-orange-200 px-4 py-3 rounded-xl mb-6 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Clock size={14} />
                  {state.ride.status === 'in_transit' ? 'Heading to destination' : 'Driver confirmed and on the way'}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${assignedInfo.name}`} className="w-16 h-16 bg-slate-100 rounded-full border-2 border-white shadow-sm" alt="Driver" />
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">{assignedInfo.name}</h3>
                    <div className="flex items-center text-xs font-bold text-slate-500 gap-3">
                      <span className="flex items-center gap-1 text-slate-700"><Star size={12} className="text-orange-500 fill-orange-500" /> {assignedInfo.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{assignedInfo.license}</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-1 uppercase font-bold tracking-widest">Verified EcoLoop</p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6 bg-slate-50 shadow-sm">
                  <div className="p-4 space-y-4 text-sm">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Pickup</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700 uppercase truncate max-w-[150px] text-right">{state.ride.pickupLocation}</p>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Drop</p>
                      </div>
                      <p className="text-xs font-bold text-slate-700 uppercase truncate max-w-[150px] text-right">{state.ride.dropoffLocation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {state.ride.status !== 'in_transit' && (
                    <button 
                    onClick={handleCancel}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-[10px] uppercase tracking-widest"
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {state.ride.status === 'completed' && assignedInfo && (
               <motion.div
               key="completed"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex-1 flex flex-col items-center justify-center text-center"
             >
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                 <ShieldCheck size={32} />
               </div>
               <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-2">You've arrived!</h3>
               <p className="text-sm font-medium text-slate-500 mb-8">Your ride was added to history.</p>
               
               <button 
                 onClick={handleCancel}
                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl shadow-lg shadow-emerald-100 transition-all text-[10px] uppercase font-bold tracking-widest"
               >
                 Acknowledge & Return
               </button>
             </motion.div>
            )}
          </AnimatePresence>
        </>
        )}
      </div>

      {/* Map UI */}
      <div className="flex-1 h-[400px] md:h-full relative order-1 md:order-2 z-0 pb-16 md:pb-0 px-4 pt-4 cursor-crosshair">
        <MapView 
          passengerLocation={passengerLoc}
          drivers={state.drivers}
          focusCenter={passengerLoc}
          onMapClick={selectingLocationFor ? handleMapClick : undefined}
          pickupCoords={pickupCoords || undefined}
          dropoffCoords={dropoffCoords || undefined}
          route={state.ride.status === 'in_transit' && assignedInfo ? [passengerLoc, assignedInfo.location] : undefined}
        />
        
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[1000] pointer-events-none">
           <div className="bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-700 text-[10px] leading-tight font-bold text-white uppercase tracking-widest whitespace-nowrap">
             Passenger Portal Active
           </div>
        </div>
      </div>
    </div>
  );
}
