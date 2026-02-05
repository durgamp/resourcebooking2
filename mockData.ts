
import { Reactor, Booking, Downtime, Team, BookingStatus, DowntimeType } from './types';
import { addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isWithinInterval, areIntervalsOverlapping, differenceInHours, isBefore, isAfter, isEqual } from 'date-fns';

export const mockReactors: Reactor[] = [
  { serialNo: 'R-101', maxCapacityLiters: 1000, capacityRange: '500-1000L', moc: 'SS316', agitatorType: 'Anchor', plantName: 'Plant Alpha', blockName: 'Block A', commissionDate: '2022-01-15' },
  { serialNo: 'R-102', maxCapacityLiters: 500, capacityRange: '0-500L', moc: 'Glass Lined', agitatorType: 'Propeller', plantName: 'Plant Alpha', blockName: 'Block A', commissionDate: '2022-03-10' },
  { serialNo: 'R-103', maxCapacityLiters: 2000, capacityRange: '1000L+', moc: 'SS316L', agitatorType: 'Turbine', plantName: 'Plant Alpha', blockName: 'Block B', commissionDate: '2021-11-20' },
  { serialNo: 'R-104', maxCapacityLiters: 1500, capacityRange: '1000L+', moc: 'Hastelloy', agitatorType: 'Magnetic', plantName: 'Plant Alpha', blockName: 'Block B', commissionDate: '2023-05-05' },
  { serialNo: 'R-201', maxCapacityLiters: 1000, capacityRange: '500-1000L', moc: 'SS316', agitatorType: 'Anchor', plantName: 'Plant Beta', blockName: 'Block C', commissionDate: '2022-01-15' },
  { serialNo: 'R-202', maxCapacityLiters: 2500, capacityRange: '1000L+', moc: 'Glass Lined', agitatorType: 'Rushton', plantName: 'Plant Beta', blockName: 'Block C', commissionDate: '2020-08-12' },
];

const today = new Date();

export const mockBookings: Booking[] = [
  {
    id: 'B1',
    reactorSerialNo: 'R-101',
    team: Team.CDS,
    productName: 'Paracetamol',
    stage: 'Intermediate',
    batchNumber: 'BT-001',
    operation: 'Reflux',
    startDateTime: subDays(today, 2),
    endDateTime: addDays(today, 1),
    status: BookingStatus.ACTUAL,
    requestedByEmail: 'john.doe@facility.com',
    createdAt: subDays(today, 5),
    updatedAt: subDays(today, 2)
  },
  {
    id: 'B2',
    reactorSerialNo: 'R-101',
    team: Team.MFG,
    productName: 'Ibuprofen',
    stage: 'Final',
    batchNumber: 'BT-105',
    operation: 'Crystallization',
    startDateTime: addDays(today, 3),
    endDateTime: addDays(today, 6),
    status: BookingStatus.PROPOSED,
    requestedByEmail: 'sarah.m@facility.com',
    createdAt: subDays(today, 1),
    updatedAt: subDays(today, 1)
  }
];

export const mockDowntimes: Downtime[] = [
  {
    id: 'D1',
    reactorSerialNo: 'R-102',
    startDateTime: subDays(today, 1),
    endDateTime: addDays(today, 1),
    type: DowntimeType.MAINTENANCE,
    reason: 'Annual calibration of sensors',
    updatedByEmail: 'maint@facility.com',
    updatedAt: subDays(today, 1),
    isCancelled: false
  }
];

/**
 * Checks for time overlaps with existing bookings and maintenance.
 * Also validates date sequence integrity.
 */
export const checkConflict = (
  reactorSerialNo: string,
  start: Date,
  end: Date,
  allBookings: Booking[],
  allDowntimes: Downtime[],
  excludeId?: string
) => {
  if (isBefore(end, start) || isEqual(end, start)) {
    return "End time must be after start time.";
  }

  const range = { start, end };
  
  // 1. Check Booking Conflicts
  const bookingConflict = allBookings.find(b => 
    b.reactorSerialNo === reactorSerialNo && 
    b.id !== excludeId &&
    b.status !== BookingStatus.CANCELLED &&
    areIntervalsOverlapping(range, { start: b.startDateTime, end: b.endDateTime })
  );

  if (bookingConflict) {
    return `Conflict: Reactor already booked for ${bookingConflict.productName} (${format(bookingConflict.startDateTime, 'HH:mm')} - ${format(bookingConflict.endDateTime, 'HH:mm')})`;
  }

  // 2. Check Downtime Conflicts
  const downtimeConflict = allDowntimes.find(d => 
    d.reactorSerialNo === reactorSerialNo && 
    d.id !== excludeId &&
    !d.isCancelled &&
    areIntervalsOverlapping(range, { start: d.startDateTime, end: d.endDateTime })
  );

  if (downtimeConflict) {
    return `Conflict: Reactor unavailable due to ${downtimeConflict.type} maintenance.`;
  }

  return null;
};

export const calculateOccupancy = (month: Date, allReactors: Reactor[], allBookings: Booking[], allDowntimes: Downtime[]) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const totalMonthHours = Math.max(0, differenceInHours(end, start));

  return allReactors.map(reactor => {
    const reactorDowntimes = allDowntimes.filter(d => 
      d.reactorSerialNo === reactor.serialNo && !d.isCancelled &&
      areIntervalsOverlapping({ start, end }, { start: d.startDateTime, end: d.endDateTime })
    );

    const downtimeHours = reactorDowntimes.reduce((acc, d) => {
      const dStart = isBefore(d.startDateTime, start) ? start : d.startDateTime;
      const dEnd = isAfter(d.endDateTime, end) ? end : d.endDateTime;
      return acc + Math.max(0, differenceInHours(dEnd, dStart));
    }, 0);

    const availableHours = Math.max(0, totalMonthHours - downtimeHours);

    const proposedHours = allBookings.filter(b => 
      b.reactorSerialNo === reactor.serialNo && b.status === BookingStatus.PROPOSED &&
      areIntervalsOverlapping({ start, end }, { start: b.startDateTime, end: b.endDateTime })
    ).reduce((acc, b) => {
      const bStart = isBefore(b.startDateTime, start) ? start : b.startDateTime;
      const bEnd = isAfter(b.endDateTime, end) ? end : b.endDateTime;
      return acc + Math.max(0, differenceInHours(bEnd, bStart));
    }, 0);

    const actualHours = allBookings.filter(b => 
      b.reactorSerialNo === reactor.serialNo && b.status === BookingStatus.ACTUAL &&
      areIntervalsOverlapping({ start, end }, { start: b.startDateTime, end: b.endDateTime })
    ).reduce((acc, b) => {
      const bStart = isBefore(b.startDateTime, start) ? start : b.startDateTime;
      const bEnd = isAfter(b.endDateTime, end) ? end : b.endDateTime;
      return acc + Math.max(0, differenceInHours(bEnd, bStart));
    }, 0);

    return {
      reactorSerialNo: reactor.serialNo,
      month: format(month, 'MMM yyyy'),
      availableHours,
      proposedHours,
      actualHours,
      downtimeHours,
      proposedPercent: availableHours > 0 ? (proposedHours / availableHours) * 100 : 0,
      actualPercent: availableHours > 0 ? (actualHours / availableHours) * 100 : 0,
      blockName: reactor.blockName,
      plantName: reactor.plantName
    };
  });
};
