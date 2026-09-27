export type SetEntry = { id: string; weight: number; reps: number; rpe?: number; done: boolean }
export type Exercise = { id: string; name: string; muscle: string; sets: SetEntry[] }
export type Workout = { id: string; date: string; muscle: string; exercises: Exercise[]; startedAt: string; endedAt?: string }
export type Food = { id: string; date: string; meal: string; name: string; quantity: number; unit: string; calories: number; protein: number; caloriesPerUnit: number; proteinPerUnit: number }
export type BodyWeight = { id: string; date: string; weight: number }
export type CustomFood = { name: string; calories: number; protein: number; serving?: string }
export type CustomExercise = { name: string; muscle: string }

export type RoutineExercise = { name: string; muscle: string }
export type DayRoutine = {
  day: string
  title: string
  muscles: string[]
  exercises: RoutineExercise[]
}

export type Store = {
  foods: Food[]
  workouts: Workout[]
  weights: BodyWeight[]
  customFoods: CustomFood[]
  customExercises: CustomExercise[]
  weeklyPlan: Record<string, DayRoutine>
}

export const today = () => new Date().toISOString().slice(0, 10)
export const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
export type WeekDay = typeof weekDays[number]

export const getTodayDayName = (): WeekDay => {
  const days: WeekDay[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[new Date().getDay()]
}

export const muscles = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'LEGS', 'ABS', 'CARDIO']

export const exercises: Record<string, string[]> = {
  CHEST: ['Barbell Bench Press', 'Incline Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Push Ups'],
  BACK: ['Deadlift', 'Lat Pulldown', 'Pull Ups', 'Barbell Row', 'Dumbbell Row', 'Seated Cable Row'],
  SHOULDERS: ['Overhead Barbell Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Face Pull', 'Shrugs'],
  BICEPS: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl'],
  TRICEPS: ['Cable Pushdown', 'Rope Pushdown', 'Skull Crushers', 'Close Grip Bench Press', 'Tricep Dips'],
  LEGS: ['Barbell Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Leg Curl', 'Lunges'],
  ABS: ['Crunches', 'Hanging Leg Raise', 'Plank', 'Russian Twist'],
  CARDIO: ['Running', 'Cycling', 'Walking', 'Stair Climber']
}

export const defaultWeeklyPlan: Record<string, DayRoutine> = {
  MONDAY: {
    day: 'MONDAY',
    title: 'Push Day',
    muscles: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    exercises: [
      { name: 'Barbell Bench Press', muscle: 'CHEST' },
      { name: 'Incline Dumbbell Press', muscle: 'CHEST' },
      { name: 'Dumbbell Shoulder Press', muscle: 'SHOULDERS' },
      { name: 'Cable Fly', muscle: 'CHEST' },
      { name: 'Rope Pushdown', muscle: 'TRICEPS' }
    ]
  },
  TUESDAY: {
    day: 'TUESDAY',
    title: 'Pull Day',
    muscles: ['BACK', 'BICEPS'],
    exercises: [
      { name: 'Deadlift', muscle: 'BACK' },
      { name: 'Lat Pulldown', muscle: 'BACK' },
      { name: 'Barbell Row', muscle: 'BACK' },
      { name: 'Barbell Curl', muscle: 'BICEPS' },
      { name: 'Hammer Curl', muscle: 'BICEPS' }
    ]
  },
  WEDNESDAY: {
    day: 'WEDNESDAY',
    title: 'Leg Day',
    muscles: ['LEGS', 'ABS'],
    exercises: [
      { name: 'Barbell Squat', muscle: 'LEGS' },
      { name: 'Leg Press', muscle: 'LEGS' },
      { name: 'Romanian Deadlift', muscle: 'LEGS' },
      { name: 'Leg Extension', muscle: 'LEGS' },
      { name: 'Hanging Leg Raise', muscle: 'ABS' }
    ]
  },
  THURSDAY: {
    day: 'THURSDAY',
    title: 'Upper Body Focus',
    muscles: ['CHEST', 'BACK', 'SHOULDERS'],
    exercises: [
      { name: 'Incline Barbell Bench Press', muscle: 'CHEST' },
      { name: 'Pull Ups', muscle: 'BACK' },
      { name: 'Overhead Barbell Press', muscle: 'SHOULDERS' },
      { name: 'Dumbbell Row', muscle: 'BACK' },
      { name: 'Lateral Raise', muscle: 'SHOULDERS' }
    ]
  },
  FRIDAY: {
    day: 'FRIDAY',
    title: 'Arms & Core',
    muscles: ['BICEPS', 'TRICEPS', 'ABS'],
    exercises: [
      { name: 'Close Grip Bench Press', muscle: 'TRICEPS' },
      { name: 'Preacher Curl', muscle: 'BICEPS' },
      { name: 'Cable Pushdown', muscle: 'TRICEPS' },
      { name: 'Barbell Curl', muscle: 'BICEPS' },
      { name: 'Plank', muscle: 'ABS' },
      { name: 'Russian Twist', muscle: 'ABS' }
    ]
  },
  SATURDAY: {
    day: 'SATURDAY',
    title: 'Legs & Cardio',
    muscles: ['LEGS', 'CARDIO', 'ABS'],
    exercises: [
      { name: 'Barbell Squat', muscle: 'LEGS' },
      { name: 'Lunges', muscle: 'LEGS' },
      { name: 'Leg Curl', muscle: 'LEGS' },
      { name: 'Running', muscle: 'CARDIO' },
      { name: 'Crunches', muscle: 'ABS' }
    ]
  },
  SUNDAY: {
    day: 'SUNDAY',
    title: 'Recovery & Conditioning',
    muscles: ['CARDIO', 'ABS'],
    exercises: [
      { name: 'Stair Climber', muscle: 'CARDIO' },
      { name: 'Walking', muscle: 'CARDIO' },
      { name: 'Plank', muscle: 'ABS' }
    ]
  }
}

export const foodDb = [
  { name: 'Idli', meal: 'Breakfast', calories: 60, protein: 2 },
  { name: 'Dosa', meal: 'Breakfast', calories: 168, protein: 4 },
  { name: 'Eggs', meal: 'Breakfast', calories: 70, protein: 6 },
  { name: 'Rice', meal: 'Lunch', calories: 205, protein: 4 },
  { name: 'Chicken', meal: 'Lunch', calories: 165, protein: 31 },
  { name: 'Paneer', meal: 'Lunch', calories: 265, protein: 18 },
  { name: 'Banana', meal: 'Snacks', calories: 105, protein: 1 },
  { name: 'Protein Shake', meal: 'Snacks', calories: 150, protein: 25 },
  { name: 'Roti', meal: 'Dinner', calories: 120, protein: 4 }
]

export const blankStore = (): Store => ({
  foods: [],
  workouts: [],
  weights: [],
  customFoods: [],
  customExercises: [],
  weeklyPlan: defaultWeeklyPlan
})

export const volume = (w: Workout) =>
  w.exercises.reduce((t, e) => t + e.sets.reduce((n, s) => n + (s.done ? s.weight * s.reps : 0), 0), 0)

export const totalSets = (w: Workout) =>
  w.exercises.reduce((a, e) => a + e.sets.length, 0)

export const calculateFood = (f: { calories: number; protein: number }, quantity: number) => ({
  calories: Math.round(f.calories * quantity),
  protein: Math.round(f.protein * quantity)
})

export const formatDate = (d: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${d}T12:00:00`))

export const exportStore = (s: Store) => JSON.stringify(s, null, 2)

export const importStore = (raw: string): Store => {
  const x = JSON.parse(raw)
  if (!x || typeof x !== 'object') throw new Error('Invalid backup file')
  return {
    foods: Array.isArray(x.foods) ? x.foods : [],
    workouts: Array.isArray(x.workouts) ? x.workouts : [],
    weights: Array.isArray(x.weights) ? x.weights : [],
    customFoods: Array.isArray(x.customFoods) ? x.customFoods : [],
    customExercises: Array.isArray(x.customExercises) ? x.customExercises : [],
    weeklyPlan: x.weeklyPlan && typeof x.weeklyPlan === 'object' ? x.weeklyPlan : defaultWeeklyPlan
  }
}

export const latestWeight = (s: Store) =>
  [...s.weights].sort((a, b) => b.date.localeCompare(a.date))[0]?.weight || 0

export const todayTotals = (s: Store) =>
  s.foods
    .filter(f => f.date === today())
    .reduce((a, f) => ({ calories: a.calories + f.calories, protein: a.protein + f.protein }), { calories: 0, protein: 0 })

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

export const storageKey = 'ironlog-store-v2'

export const loadStore = async (): Promise<Store> => {
  let loaded: Store | null = null

  if (typeof indexedDB !== 'undefined') {
    try {
      loaded = await new Promise<Store | null>(resolve => {
        const r = indexedDB.open('ironlog-db', 1)
        r.onupgradeneeded = () => r.result.createObjectStore('store')
        r.onsuccess = () => {
          try {
            const tx = r.result.transaction('store')
            const g = tx.objectStore('store').get(storageKey)
            g.onsuccess = () => {
              if (g.result) {
                resolve({
                  foods: Array.isArray(g.result.foods) ? g.result.foods : [],
                  workouts: Array.isArray(g.result.workouts) ? g.result.workouts : [],
                  weights: Array.isArray(g.result.weights) ? g.result.weights : [],
                  customFoods: Array.isArray(g.result.customFoods) ? g.result.customFoods : [],
                  customExercises: Array.isArray(g.result.customExercises) ? g.result.customExercises : [],
                  weeklyPlan: g.result.weeklyPlan && typeof g.result.weeklyPlan === 'object' ? g.result.weeklyPlan : defaultWeeklyPlan
                })
              } else {
                resolve(null)
              }
            }
            g.onerror = () => resolve(null)
          } catch {
            resolve(null)
          }
        }
        r.onerror = () => resolve(null)
      })
    } catch {}
  }

  if (!loaded && typeof localStorage !== 'undefined') {
    try {
      const s = localStorage.getItem(storageKey)
      if (s) {
        const x = JSON.parse(s)
        loaded = {
          foods: Array.isArray(x.foods) ? x.foods : [],
          workouts: Array.isArray(x.workouts) ? x.workouts : [],
          weights: Array.isArray(x.weights) ? x.weights : [],
          customFoods: Array.isArray(x.customFoods) ? x.customFoods : [],
          customExercises: Array.isArray(x.customExercises) ? x.customExercises : [],
          weeklyPlan: x.weeklyPlan && typeof x.weeklyPlan === 'object' ? x.weeklyPlan : defaultWeeklyPlan
        }
      }
    } catch {}
  }

  return loaded || blankStore()
}

export const saveStore = async (s: Store) => {
  if (typeof indexedDB !== 'undefined') {
    try {
      const r = indexedDB.open('ironlog-db', 1)
      r.onupgradeneeded = () => r.result.createObjectStore('store')
      r.onsuccess = () => {
        try {
          const tx = r.result.transaction('store', 'readwrite')
          tx.objectStore('store').put(s, storageKey)
        } catch {}
      }
    } catch {}
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(s))
    } catch {}
  }
}
