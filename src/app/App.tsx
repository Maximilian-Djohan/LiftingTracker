import { useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { LogWorkout } from '../components/LogWorkout'
import { WorkoutCard } from '../components/WorkoutCard'
import { Stats } from '../components/Stats'
import './styles.css'

export default function App() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const [logging, setLogging] = useState(false)

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>Lifting Tracker</h1>
        </div>
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
            <div className="new-workout-hero">
              <button className="btn-hero" onClick={() => setLogging(true)}>
                + New Workout
              </button>
            </div>

            <Stats workouts={workouts} />

            <section className="history">
              <h2>History</h2>
              {workouts.length === 0 ? (
                <div className="empty-state">
                  <p>No workouts yet — hit “New Workout” to log your first session.</p>
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
