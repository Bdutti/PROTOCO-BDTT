CREATE TABLE workout_sessions (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT,
  total_exercises INTEGER,
  completed_exercises INTEGER DEFAULT 0
);

CREATE TABLE exercise_logs (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2),
  reps INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  completed_at TIMESTAMP
);

CREATE TABLE exercise_notes (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(day_key, exercise_name)
);

CREATE TABLE weight_tracking (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  logged_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_schedules (
  id SERIAL PRIMARY KEY,
  day_key TEXT NOT NULL,
  scheduled_day TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_reminders (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES workout_schedules(id) ON DELETE CASCADE,
  reminder_time TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_workout_sessions_day_key ON workout_sessions(day_key);
CREATE INDEX idx_workout_sessions_started_at ON workout_sessions(started_at DESC);
CREATE INDEX idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX idx_exercise_logs_exercise_name ON exercise_logs(exercise_name);
CREATE INDEX idx_weight_tracking_exercise ON weight_tracking(day_key, exercise_name, logged_at DESC);
CREATE INDEX idx_workout_schedules_active ON workout_schedules(active, scheduled_day);
CREATE INDEX idx_progress_day_exercise ON progress(day_key, exercise_name);
CREATE INDEX idx_exercises_day_key ON exercises(day_key);
