import { useState } from 'react'
import { useWorkouts } from './hooks/useWorkouts'
import { LogWorkout } from './components/LogWorkout'
import { WorkoutCard } from './components/WorkoutCard'
import { Stats } from './components/Stats'

export default function App() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const [logging, setLogging] = useState(false)

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>Lifting Tracker</h1>
        </div>
        {!logging && (
          <button className="btn-primary" onClick={() => setLogging(true)}>
            + New Workout
          </button>
        )}
      </header>

      <main className="app-main">
        {logging ? (
          <LogWorkout
            defaultUnit="kg"
            onSave={workout => {
              addWorkout(workout)
              setLogging(false)
            }}
            onCancel={() => setLogging(false)}
          />
        ) : (
          <>
            <Stats workouts={workouts} />

            <section className="history">
              <h2>History</h2>
              {workouts.length === 0 ? (
                <div className="empty-state">
                  <p>No workouts yet.</p>
                  <button className="btn-primary" onClick={() => setLogging(true)}>
                    Log your first workout
                  </button>
                </div>
              ) : (
                <div className="workout-grid">
                  {workouts.map(w => (
                    <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
