
import { Reactor, Booking, Downtime } from '../types';

const API_BASE = '/api'; // Placeholder for .NET Backend URL

export const api = {
  fetchReactors: async (): Promise<Reactor[]> => {
    // In a real environment: return (await fetch(`${API_BASE}/reactor`)).json();
    return []; // Handled by state in App.tsx for mock purposes
  },
  
  saveBooking: async (booking: Booking): Promise<void> => {
    console.info("Dispatching to .NET Backend:", booking);
    // await fetch(`${API_BASE}/booking`, { method: 'POST', body: JSON.stringify(booking) });
  },

  deleteBooking: async (id: string, isActual: boolean): Promise<void> => {
    if (isActual) throw new Error("Immutable record");
    console.info("Deleting from .NET Backend:", id);
  }
};
