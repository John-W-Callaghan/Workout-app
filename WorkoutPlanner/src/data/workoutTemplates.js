// A list of predefined workout routines
export const WORKOUT_TEMPLATES = [
  {
    id: 'template_push',
    name: 'Classic Push Day',
    exercises: [
      { id: 1, name: 'Bench Press', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 2, name: 'Overhead Press', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 3, name: 'Incline Press', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 4, name: 'Tricep Extensions', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
    ]
  },
  {
    id: 'template_pull',
    name: 'Classic Pull Day',
    exercises: [
      { id: 1, name: 'Pull-ups', notes: 'Assisted or bodyweight', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 2, name: 'Rows', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 3, name: 'Lat Pulldowns', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 4, name: 'Bicep Curls', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
    ]
  },
  {
    id: 'template_legs',
    name: 'Leg Day',
    exercises: [
      { id: 1, name: 'Squats', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 2, name: 'Romanian Deadlift With Dumbbells', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 3, name: 'Leg Press', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }] },
      { id: 4, name: 'Calf Raises', notes: '', sets: [{ weight: '', reps: '', completed: false }, { weight: '', reps: '', completed: false }, { weight: '', reps: '', completed:false }] },
    ]
  },
];