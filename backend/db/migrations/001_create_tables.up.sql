CREATE TABLE workout_days (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  day_index INTEGER NOT NULL
);

CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL,
  name TEXT NOT NULL,
  series INTEGER NOT NULL,
  reps TEXT NOT NULL,
  observations TEXT,
  exercise_index INTEGER NOT NULL
);

CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  UNIQUE(day_key, exercise_name, set_index)
);
