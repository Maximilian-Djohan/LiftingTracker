/* localStorage persistence layer. All data stays on this device. */
const Store = (() => {
  const K_WORKOUTS = "lt_workouts";
  const K_CUSTOM = "lt_customExercises";
  const K_UNIT = "lt_unit";

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("Failed to read", key, e);
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to write", key, e);
    }
  }

  // ---- Workouts ----
  // A workout: { date: "YYYY-MM-DD", exercises: [{ exId, name, muscle, sets: [{reps, weight}] }] }
  function getWorkouts() {
    return read(K_WORKOUTS, []);
  }
  function getWorkout(date) {
    return getWorkouts().find((w) => w.date === date) || null;
  }
  function saveWorkout(workout) {
    const all = getWorkouts();
    const idx = all.findIndex((w) => w.date === workout.date);
    const hasContent = workout.exercises && workout.exercises.length > 0;
    if (idx >= 0) {
      if (hasContent) all[idx] = workout;
      else all.splice(idx, 1); // remove empty workouts
    } else if (hasContent) {
      all.push(workout);
    }
    write(K_WORKOUTS, all);
  }
  function deleteWorkout(date) {
    write(K_WORKOUTS, getWorkouts().filter((w) => w.date !== date));
  }

  // ---- Custom exercises ----
  function getCustomExercises() {
    return read(K_CUSTOM, []);
  }
  function addCustomExercise(ex) {
    const all = getCustomExercises();
    all.push(ex);
    write(K_CUSTOM, all);
  }
  function removeCustomExercise(id) {
    write(K_CUSTOM, getCustomExercises().filter((e) => e.id !== id));
  }

  // ---- Unit ----
  function getUnit() {
    return read(K_UNIT, "kg");
  }
  function setUnit(u) {
    write(K_UNIT, u);
  }

  return {
    getWorkouts,
    getWorkout,
    saveWorkout,
    deleteWorkout,
    getCustomExercises,
    addCustomExercise,
    removeCustomExercise,
    getUnit,
    setUnit,
  };
})();
