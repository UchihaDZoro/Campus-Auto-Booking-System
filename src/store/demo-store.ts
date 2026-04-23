import { useState, useEffect } from 'react';

const DEMO_STATE_KEY = 'ecoloop_demo_state_v4';

export const DEFAULT_CAMPUS_CENTER: [number, number] = [37.4275, -122.1697];

export type DriverStatus = 'offline' | 'online' | 'busy' | 'suspended';

export interface Driver {
  id: string;
  name: string;
  license: string;
  rating: number;
  status: DriverStatus;
  location: [number, number];
  password?: string;
}

export interface PastRide {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId: string;
  driverName: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  fare: number;
  rating: number | null;
}

export interface Ride {
  id: string;
  passengerName: string;
  passengerId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
  status: 'idle' | 'searching' | 'pending_driver' | 'accepted' | 'arriving' | 'in_transit' | 'completed';
  assignedDriverId: string | null;
  rejectedBy: string[];
}

export interface AppState {
  drivers: Driver[];
  ride: Ride;
  pastRides: PastRide[];
  passengerCoords: [number, number] | null;
  systemReady: boolean;
}

const oneDay = 24 * 60 * 60 * 1000;
const now = Date.now();

function generateRandomOffset(center: [number, number], range: number = 0.005): [number, number] {
  return [
    center[0] + (Math.random() - 0.5) * range,
    center[1] + (Math.random() - 0.5) * range
  ];
}

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'DRV-042', name: 'Rajesh K.', license: 'ER-042', rating: 4.8, status: 'online', location: generateRandomOffset(DEFAULT_CAMPUS_CENTER), password: '123' },
  { id: 'DRV-019', name: 'Amit S.', license: 'ER-019', rating: 4.9, status: 'online', location: generateRandomOffset(DEFAULT_CAMPUS_CENTER), password: '123' },
  { id: 'DRV-088', name: 'Priya M.', license: 'ER-088', rating: 4.7, status: 'online', location: generateRandomOffset(DEFAULT_CAMPUS_CENTER), password: '123' },
  { id: 'DRV-003', name: 'Vikram B.', license: 'ER-003', rating: 4.6, status: 'offline', location: generateRandomOffset(DEFAULT_CAMPUS_CENTER), password: '123' },
  { id: 'DRV-027', name: 'Sunil T.', license: 'ER-027', rating: 4.9, status: 'suspended', location: generateRandomOffset(DEFAULT_CAMPUS_CENTER), password: '123' },
];

const mockPastRides: PastRide[] = [
  { id: 'R-1001', passengerId: '23je0699', passengerName: 'Pathan Gulamgaush', driverId: 'DRV-042', driverName: 'Rajesh K.', pickupLocation: 'Library', dropoffLocation: 'Hostel A', date: new Date(now - 2 * oneDay).toISOString(), fare: 1.5, rating: 5 },
  { id: 'R-1002', passengerId: '23je0699', passengerName: 'Pathan Gulamgaush', driverId: 'DRV-019', driverName: 'Amit S.', pickupLocation: 'Main Gate', dropoffLocation: 'Science Block', date: new Date(now - 4 * oneDay).toISOString(), fare: 2.0, rating: null },
  { id: 'R-1003', passengerId: '23je0699', passengerName: 'Pathan Gulamgaush', driverId: 'DRV-088', driverName: 'Priya M.', pickupLocation: 'Admin Block', dropoffLocation: 'Library', date: new Date(now - 5 * oneDay).toISOString(), fare: 1.0, rating: 4 },
];

const defaultState: AppState = {
  drivers: INITIAL_DRIVERS,
  ride: {
    id: '',
    passengerName: '',
    passengerId: '',
    pickupLocation: 'Current Location',
    dropoffLocation: 'Main Gate',
    status: 'idle',
    assignedDriverId: null,
    rejectedBy: [],
  },
  pastRides: mockPastRides,
  passengerCoords: null,
  systemReady: false,
};

export function useDemoStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(DEMO_STATE_KEY);
      return saved ? JSON.parse(saved) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DEMO_STATE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Failed to parse demo state");
        }
      }
    };
    
    const intervalId = setInterval(() => {
      try {
        const saved = localStorage.getItem(DEMO_STATE_KEY);
        if (saved) {
           const parsed = JSON.parse(saved);
           if (JSON.stringify(parsed) !== JSON.stringify(state)) {
             setState(parsed);
           }
        }
      } catch (err) {}
    }, 500);

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(intervalId);
    };
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setState(prev => {
      const newDrivers = prev.drivers.map(d => d.id === id ? { ...d, ...updates } : d);
      const next = { ...prev, drivers: newDrivers };
      localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addDriver = (driver: Driver) => {
    setState(prev => {
      const next = { ...prev, drivers: [...prev.drivers, driver] };
      localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateRide = (updates: Partial<Ride>) => {
    setState(prev => {
      const next = { ...prev, ride: { ...prev.ride, ...updates } };
      localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addPastRide = (ride: PastRide) => {
    setState(prev => {
      const next = { ...prev, pastRides: [ride, ...prev.pastRides] };
      localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const updatePastRideRating = (rideId: string, rating: number) => {
    setState(prev => {
      const next = { ...prev, pastRides: prev.pastRides.map(r => r.id === rideId ? { ...r, rating } : r) };
      localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const initializeLocation = (coords: [number, number]) => {
    if (state.systemReady) return;
    
    const scatteredDrivers = INITIAL_DRIVERS.map((d) => {
      const latOffset = (Math.random() - 0.5) * 0.015;
      const lngOffset = (Math.random() - 0.5) * 0.015;
      return {
        ...d,
        location: [coords[0] + latOffset, coords[1] + lngOffset] as [number, number]
      };
    });

    updateState({
      passengerCoords: coords,
      drivers: scatteredDrivers,
      systemReady: true
    });
  };

  const resetState = () => {
    updateState({
      ride: { ...defaultState.ride, passengerName: state.ride.passengerName, passengerId: state.ride.passengerId },
      drivers: state.drivers.map(d => ({ ...d, status: d.status === 'busy' ? 'online' : d.status }))
    });
  };

  return { state, updateState, updateDriver, addDriver, updateRide, addPastRide, updatePastRideRating, initializeLocation, resetState };
}
