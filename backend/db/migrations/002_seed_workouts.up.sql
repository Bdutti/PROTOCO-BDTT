INSERT INTO workout_days (day_key, name, day_index) VALUES
  ('push1', 'PUSH 1', 0),
  ('pull1', 'PULL 1', 1),
  ('legs1', 'LEGS 1', 2),
  ('push2', 'PUSH 2', 3),
  ('pull2', 'PULL 2', 4),
  ('legs2', 'LEGS 2', 5);

-- PUSH 1 exercises
INSERT INTO exercises (day_key, name, series, reps, observations, exercise_index) VALUES
  ('push1', 'Supino Inclinado com Halteres', 3, '6-8', NULL, 0),
  ('push1', 'Supino Reto na Máquina/Barra', 3, '8-12', NULL, 1),
  ('push1', 'Desenvolvimento com Halteres', 3, '8-10', NULL, 2),
  ('push1', 'Elevação Lateral', 3, '12-15', NULL, 3),
  ('push1', 'Extensão de Tríceps com Cabo', 3, '10-15', NULL, 4),
  ('push1', 'Tríceps Corda', 3, '12-15', NULL, 5);

-- PULL 1 exercises
INSERT INTO exercises (day_key, name, series, reps, observations, exercise_index) VALUES
  ('pull1', 'Puxada Alta', 3, '8-12', NULL, 0),
  ('pull1', 'Remada Curvada', 3, '8-10', NULL, 1),
  ('pull1', 'Pullover no Cabo', 3, '12-15', NULL, 2),
  ('pull1', 'Rosca Alternada Sentado', 3, '8-12', NULL, 3),
  ('pull1', 'Rosca Martelo', 3, '10-15', NULL, 4),
  ('pull1', 'Face Pull', 3, '15-20', NULL, 5);

-- LEGS 1 exercises
INSERT INTO exercises (day_key, name, series, reps, observations, exercise_index) VALUES
  ('legs1', 'Agachamento Livre/Hack', 3, '6-10', NULL, 0),
  ('legs1', 'Cadeira Extensora', 3, '12-15', NULL, 1),
  ('legs1', 'Mesa Flexora', 3, '10-15', NULL, 2),
  ('legs1', 'Stiff', 3, '8-12', NULL, 3),
  ('legs1', 'Elevação de Panturrilha', 4, '15-20', NULL, 4),
  ('legs1', 'Abdominais na Polia', 3, '15-20', NULL, 5);

-- PUSH 2 exercises
INSERT INTO exercises (day_key, name, series, reps, observations, exercise_index) VALUES
  ('push2', 'Crucifixo Inclinado', 3, '12-15', NULL, 0),
  ('push2', 'Paralelas', 3, '8-12', NULL, 1),
  ('push2', 'Elevação Lateral', 3, '10-15', NULL, 2),
  ('push2', 'Elevação Frontal', 3, '10-12', NULL, 3),
  ('push2', 'Mergulho no Banco', 3, '10-15', NULL, 4),
  ('push2', 'Extensão Unilateral', 3, '12-15', NULL, 5);

-- PULL 2 exercises
INSERT INTO exercises (day_key, name, series, reps, observations, exercise_index) VALUES
  ('pull2', 'Remada Sentada', 3, '8-12', NULL, 0),
  ('pull2', 'Puxada Invertida', 3, '8-10', NULL, 1),
  ('pull2', 'Remada com Máquina Hammer', 3, '10-15', NULL, 2),
  ('pull2', 'Rosca Concentrada', 3, '8-10', NULL, 3),
  ('pull2', 'Rosca na Barra', 3, '8-12', NULL, 4),
  ('pull2', 'Rosca Punho', 3, '15-20', NULL, 5);

-- LEGS 2 exercises
INSERT INTO exercises (day_key, name, series, reps, observations, exercise_index) VALUES
  ('legs2', 'Cadeira Flexora Sentada', 3, '12-15', NULL, 0),
  ('legs2', 'Elevação Pélvica', 3, '8-12', NULL, 1),
  ('legs2', 'Leg Press 45º', 3, '8-12', NULL, 2),
  ('legs2', 'Avanço/Passada', 3, '10-15', NULL, 3),
  ('legs2', 'Panturrilha no Leg Press', 4, '15-20', NULL, 4),
  ('legs2', 'Prancha Abdominal', 3, '60s', NULL, 5);
