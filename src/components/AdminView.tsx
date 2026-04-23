import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Car, Map, Banknote, ShieldBan, ShieldCheck, MoreVertical, Plus, X, Lock, Check, AlertTriangle, Activity } from 'lucide-react';
import { useDemoStore } from '../store/demo-store';
import MapView from './MapView';

const mockData = [
  { time: '08:00', rides: 14 },
  { time: '10:00', rides: 45 },
  { time: '12:00', rides: 85 },
  { time: '14:00', rides: 110 },
  { time: '16:00', rides: 90 },
  { time: '18:00', rides: 130 },
  { time: '20:00', rides: 60 },
];

export default function AdminView() {
  const { state, updateDriver, addDriver } = useDemoStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drivers' | 'map'>('dashboard');
  
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPassword, setNewDriverPassword] = useState('123');

  const onlineDrivers = state.drivers.filter(d => d.status === 'online').length;
  const busyDrivers = state.drivers.filter(d => d.status === 'busy').length;
  const totalActive = onlineDrivers + busyDrivers;

  const activeRides = state.ride.status !== 'idle' ? 1 : 0; // Simple dummy counter for demo since we only have single ride state

  const handleAddDriver = (e: React.FormEvent) => {
     e.preventDefault();
     const id = `DRV-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`;
     addDriver({
        id,
        name: newDriverName,
        license: `ER-${id.split('-')[1]}`,
        rating: 5.0,
        status: 'offline', // default
        location: state.drivers[0].location, // dump near first driver
        password: newDriverPassword
     });
     setShowAddDriver(false);
     setNewDriverName('');
     setNewDriverPassword('123');
  }

  const handleStatusChange = (id: string, currentStatus: string) => {
     if (currentStatus === 'suspended') {
        updateDriver(id, { status: 'offline' });
     } else {
        updateDriver(id, { status: 'suspended' });
     }
  };

  const totalRevenue = state.pastRides.reduce((acc, ride) => acc + ride.fare, 0);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Nav */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
               <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-xl font-bold tracking-tight text-slate-800">EcoLoop Dashboard</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Control Center</p>
            </div>
         </div>
         
         <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Insights</button>
           <button onClick={() => setActiveTab('drivers')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'drivers' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Fleet ({state.drivers.length})</button>
           <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'map' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Live Map</button>
         </div>
      </div>

      {activeTab === 'dashboard' && (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 pb-12">
         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard title="Total Users" value="4,291" trend="+12% this week" icon={<Users size={24} className="text-blue-500" />} />
           <StatCard title="Active Drivers" value={totalActive.toString()} trend={`${state.drivers.length - totalActive} offline`} icon={<Car size={24} className="text-emerald-500" />} />
           <StatCard title="Total Bookings" value={state.pastRides.length.toString()} trend="+5% vs yesterday" icon={<Map size={24} className="text-orange-500" />} />
           <StatCard title="Fleet Revenue" value={`$${totalRevenue.toFixed(2)}`} trend="+8% vs yesterday" icon={<Banknote size={24} className="text-slate-600" />} />
         </div>

         {/* Main Content Area */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Area */}
             <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6">
                <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Ride Demand Tracker</h3>
                  <select className="bg-slate-50 font-bold border border-slate-200 text-[10px] uppercase tracking-widest rounded-lg px-3 py-2 text-slate-500 focus:outline-none">
                     <option>Today</option>
                     <option>This Week</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: '2px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                      />
                      <Area type="monotone" dataKey="rides" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRides)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

            {/* Live Feed / Active Issues */}
             <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 overflow-hidden flex flex-col">
                <h3 className="font-bold text-slate-700 uppercase tracking-widest text-[10px] mb-6">System Alerts</h3>
                
                <div className="space-y-4">
                  {state.drivers.filter(d => d.status === 'suspended').length > 0 ? (
                     <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex gap-3 text-xs font-bold">
                        <ShieldBan size={16} className="shrink-0 text-red-500 mt-0.5" />
                        <div>
                         <p className="text-slate-800 font-bold tracking-tight text-xs">Suspended Drivers</p>
                         <p className="font-medium mt-1">{state.drivers.filter(d => d.status === 'suspended').length} drivers accounts are flagged as suspended.</p>
                        </div>
                     </div>
                  ) : (
                     <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 flex gap-3 text-xs font-bold">
                        <ShieldCheck size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-slate-800 font-bold tracking-tight text-xs">Fleet Operational</p>
                          <p className="font-medium mt-1">All driver statuses are normalized.</p>
                        </div>
                     </div>
                  )}

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                    <div className="py-0.5 pl-2"><Map size={16} className="text-orange-500"/></div>
                    <div>
                        <p className="text-slate-800 font-bold tracking-tight text-xs">Demand Notification</p>
                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed mt-1">System simulated load at 80% capacity.</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                    <div className="py-0.5 pl-2"><Activity size={16} className="text-blue-500"/></div>
                    <div>
                        <p className="text-slate-800 font-bold tracking-tight text-xs">Status Update</p>
                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed mt-1">{activeRides} rides currently in progress or waiting for assignment.</p>
                    </div>
                  </div>
                </div>
             </div>
         </div>
      </div>
      )}

      {activeTab === 'drivers' && (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 relative">
         {showAddDriver && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                  <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
                     <button onClick={() => setShowAddDriver(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                        <X size={16} />
                     </button>
                     <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl mb-4 flex items-center justify-center">
                        <Users size={24} />
                     </div>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Fleet Management</p>
                     <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Provision Terminal</h2>
                     
                     <form onSubmit={handleAddDriver} className="space-y-4">
                        <div>
                           <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1">Driver Full Name</label>
                           <input 
                             required
                             type="text" 
                             value={newDriverName}
                             onChange={e => setNewDriverName(e.target.value)}
                             className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500" 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1">Temporary Password</label>
                           <div className="relative">
                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                             <input 
                               required
                               type="text" 
                               value={newDriverPassword}
                               onChange={e => setNewDriverPassword(e.target.value)}
                               className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500" 
                             />
                           </div>
                        </div>
                        
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 mt-4 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                          <Check size={16} /> Deploy Terminal
                        </button>
                     </form>
                  </div>
              </div>
           )}

         {/* Driver Management Table */}
         <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-xl overflow-hidden relative z-10">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Registry</h3>
                <p className="text-xl font-black text-slate-800">Fleet Profiles</p>
              </div>
              <button onClick={() => setShowAddDriver(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors shadow-lg shadow-slate-200 flex items-center gap-2">
                <Plus size={16} /> Register Vehicle
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest">Driver</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest">Auth</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {state.drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                           <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${driver.name}`} className="w-10 h-10 border border-slate-200 bg-white rounded-full" alt="Avatar"/>
                           <div>
                             <div className="font-bold text-slate-800 text-base">{driver.name}</div>
                             <div className="text-slate-400 text-[10px] uppercase font-bold mt-0.5">{driver.id} • {driver.license}</div>
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest
                          ${driver.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 
                            driver.status === 'busy' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                            driver.status === 'suspended' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-slate-100 text-slate-500'}
                        `}>
                          {driver.status === 'suspended' && <ShieldBan size={12} />}
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-800 font-bold text-xs">
                         {driver.password ? (
                           <div className="bg-slate-100 text-slate-500 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] uppercase tracking-widest">
                             <Lock size={12}/> {driver.password}
                           </div>
                         ) : <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Unset</span>}
                      </td>
                      <td className="px-8 py-5 flex justify-end">
                        <button 
                             onClick={() => handleStatusChange(driver.id, driver.status)}
                             className={`text-[10px] uppercase font-bold tracking-widest px-4 py-2 flex items-center gap-2 rounded-lg transition-all shadow-sm ${
                               driver.status === 'suspended' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200'
                             }`}
                          >
                             {driver.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </div>
      )}

      {activeTab === 'map' && (
         <div className="flex-1 relative border-t border-slate-200">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-slate-700">
               <p className="text-[10px] font-bold text-white uppercase tracking-widest"><Map className="inline mr-2" size={14}/> Drag Markers to teleport drivers</p>
            </div>
            
            <MapView 
               passengerLocation={state.passengerCoords}
               drivers={state.drivers}
               focusCenter={state.passengerCoords}
               onDriverMove={(id, coords) => updateDriver(id, { location: coords })}
               pickupCoords={state.ride.pickupCoords}
               dropoffCoords={state.ride.dropoffCoords}
            />

            <div className="absolute bottom-6 left-6 right-6 flex justify-center pointer-events-none">
             <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-6 border border-slate-200 pointer-events-auto">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full border border-emerald-600"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-orange-500 rounded-full border border-orange-600"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">In Ride</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-slate-400 rounded-full border border-slate-500"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Offline</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Suspended</span>
                </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-slate-200 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md uppercase tracking-widest">Live</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black tracking-tight text-slate-800 mb-2">{value}</h4>
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{trend}</p>
      </div>
    </div>
  );
}
