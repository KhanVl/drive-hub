CREATE TABLE cars (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  fuel TEXT NOT NULL,
  drive TEXT NOT NULL,
  price BIGINT NOT NULL CHECK (price > 0),
  tone TEXT NOT NULL DEFAULT 'graphite',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE car_photos (
  id BIGSERIAL PRIMARY KEY,
  car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE inquiries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id BIGINT REFERENCES cars(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX cars_status_updated_idx ON cars(status, updated_at DESC);
CREATE INDEX inquiries_status_created_idx ON inquiries(status, created_at DESC);
CREATE INDEX inquiries_user_created_idx ON inquiries(user_id, created_at DESC);

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available cars" ON cars FOR SELECT USING (status = 'available');
CREATE POLICY "Public can view photos of available cars" ON car_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM cars WHERE cars.id = car_photos.car_id AND cars.status = 'available')
);
CREATE POLICY "Users can view own inquiries" ON inquiries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inquiries" ON inquiries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage cars" ON cars FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins manage car photos" ON car_photos FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins manage inquiries" ON inquiries FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
