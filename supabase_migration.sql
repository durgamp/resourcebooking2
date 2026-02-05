-- Reactors Table
CREATE TABLE reactors (
  serialNo TEXT PRIMARY KEY,
  maxCapacityLiters INTEGER NOT NULL,
  capacityRange TEXT NOT NULL,
  moc TEXT NOT NULL,
  agitatorType TEXT NOT NULL,
  plantName TEXT NOT NULL,
  blockName TEXT NOT NULL,
  commissionDate DATE NOT NULL,
  notes TEXT
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reactorSerialNo TEXT REFERENCES reactors(serialNo),
  team TEXT NOT NULL,
  productName TEXT NOT NULL,
  stage TEXT NOT NULL,
  batchNumber TEXT NOT NULL,
  operation TEXT NOT NULL,
  startDateTime TIMESTAMPTZ NOT NULL,
  endDateTime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  requestedByEmail TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- Downtimes Table
CREATE TABLE downtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reactorSerialNo TEXT REFERENCES reactors(serialNo),
  startDateTime TIMESTAMPTZ NOT NULL,
  endDateTime TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  updatedByEmail TEXT,
  updatedAt TIMESTAMPTZ DEFAULT now(),
  isCancelled BOOLEAN DEFAULT false
);

-- Note: In the api service, I've used camelCase for column names to match the existing Typescript interfaces 
-- so we don't need complex mapping. Ensure you enable RLS or set permissions as needed.
