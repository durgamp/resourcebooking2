import { Reactor, Booking, Downtime } from '../types';
import { supabase } from './supabaseClient';

export const api = {
  fetchReactors: async (): Promise<Reactor[]> => {
    const { data, error } = await supabase
      .from('reactors')
      .select('*');

    if (error) throw error;
    return data as Reactor[];
  },

  saveBooking: async (booking: Booking): Promise<void> => {
    const { error } = await supabase
      .from('bookings')
      .upsert({
        id: booking.id,
        reactorSerialNo: booking.reactorSerialNo,
        team: booking.team,
        productName: booking.productName,
        stage: booking.stage,
        batchNumber: booking.batchNumber,
        operation: booking.operation,
        startDateTime: booking.startDateTime.toISOString(),
        endDateTime: booking.endDateTime.toISOString(),
        status: booking.status
      });

    if (error) throw error;
  },

  deleteBooking: async (id: string, isActual: boolean): Promise<void> => {
    if (isActual) throw new Error("Immutable record");

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
