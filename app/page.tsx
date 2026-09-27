"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Activity, ArrowUpRight, BarChart3, Check, ChevronRight, CircleUserRound,
  Database, Dumbbell, Download, Edit2, Flame, LayoutDashboard, Plus, Scale,
  Search, Settings2, Trash2, Trophy, Upload, Utensils, X
} from "lucide-react"
import {
  blankStore, calculateFood, clone, defaultWeeklyPlan, exercises, foodDb,
  getTodayDayName, latestWeight, loadStore, muscles, saveStore, today,
  todayTotals, uid, volume, weekDays, exportStore, importStore,
  type BodyWeight, type DayRoutine, type Food, type RoutineExercise,
  type SetEntry, type Store, type WeekDay, type Workout, type Exercise
} from "@/lib/ironlog"

/* ── constants ─────────────────────────────────────────────────────── */
type Tab = "home" | "workout" | "nutrition" | "progress" | "history"
const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"]

const newDayWorkout = (routine: DayRoutine): Workout => ({
  id: uid(),
  date: today(),
  muscle: `${routine.day} · ${routine.title}`,
  startedAt: new Date().toISOString(),
  exercises: routine.exercises.map(e => ({
    id: uid(),
    name: e.name,
    muscle: e.muscle,
    sets: [{ id: uid(), weight: 0, reps: 0, done: false }]
  }))
})

const newSingleWorkout = (muscle: string, exercise: string): Workout => ({
  id: uid(),
  date: today(),
  muscle,
  startedAt: new Date().toISOString(),
  exercises: [{ id: uid(), name: exercise, muscle, sets: [{ id: uid(), weight: 0, reps: 0, done: false }] }]
})

/* ── root component ────────────────────────────────────────────────── */
export default function Home() {
  /* core state */
  const [tab, setTab] = useState<Tab>("home")
  const [store, setStore] = useState<Store>(blankStore())
  const [ready, setReady] = useState(false)

  /* workout & routine state */
  const [selectedDay, setSelectedDay] = useState<WeekDay>(getTodayDayName())
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [selectedMuscle, setSelectedMuscle] = useState("CHEST")
  const [selectedExercise, setSelectedExercise] = useState(exercises.CHEST[0])
  const [activeExIdx, setActiveExIdx] = useState(0)

  /* modals */
  const [modal, setModal] = useState<"food" | "weight" | "exercise" | "customFood" | "data" | "editRoutine" | null>(null)
  const [historyItem, setHistoryItem] = useState<Workout | null>(null)

  /* routine edit modal state */
  const [editingDay, setEditingDay] = useState<WeekDay>(getTodayDayName())
  const [routineTitleInput, setRoutineTitleInput] = useState("")
  const [routineMusclesInput, setRoutineMusclesInput] = useState<string[]>([])
  const [routineExercisesInput, setRoutineExercisesInput] = useState<RoutineExercise[]>([])

  /* food modal state */
  const [foodQuery, setFoodQuery] = useState("")
  const [meal, setMeal] = useState("Breakfast")
  const [quantity, setQuantity] = useState("1")
  const [foodName, setFoodName] = useState("")

  /* custom food modal state */
  const [cfName, setCfName] = useState("")
  const [cfCalories, setCfCalories] = useState("")
  const [cfProtein, setCfProtein] = useState("")
  const [cfServing, setCfServing] = useState("")

  /* other modal state */
  const [weightInput, setWeightInput] = useState("")
  const [exerciseNameInput, setExerciseNameInput] = useState("")
  const [message, setMessage] = useState("")

  /* ── persistence ──────────────────────────────────────────────── */
  useEffect(() => { loadStore().then(s => { setStore(s); setReady(true) }) }, [])
  useEffect(() => { if (ready) saveStore(store) }, [store, ready])

  /* ── derived values ───────────────────────────────────────────── */
  const totals = todayTotals(store)
  const currentWeight = latestWeight(store)
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const todayDay = getTodayDayName()
  const notify = useCallback((text: string) => { setMessage(text); window.setTimeout(() => setMessage(""), 2400) }, [])

  /* weekly plan */
  const weeklyPlan = store.weeklyPlan || defaultWeeklyPlan
  const currentDayRoutine = weeklyPlan[selectedDay] || defaultWeeklyPlan[selectedDay]
  const todayRoutine = weeklyPlan[todayDay] || defaultWeeklyPlan[todayDay]

  /* combined exercise list for current muscle */
  const exerciseList = useMemo(() => {
    const base = exercises[selectedMuscle] || []
    const custom = store.customExercises.filter(c => c.muscle === selectedMuscle).map(c => c.name)
    return [...base, ...custom.filter(n => !base.includes(n))]
  }, [selectedMuscle, store.customExercises])

  /* all available exercises with muscles */
  const allExercises = useMemo(() => {
    const list: { name: string; muscle: string }[] = []
    for (const [m, exs] of Object.entries(exercises)) {
      for (const e of exs) list.push({ name: e, muscle: m })
    }
    for (const ce of store.customExercises) {
      if (!list.some(e => e.name === ce.name)) list.push({ name: ce.name, muscle: ce.muscle })
    }
    return list
  }, [store.customExercises])

  /* ── workout actions ──────────────────────────────────────────── */
  const startDayRoutineWorkout = (dayToStart: WeekDay) => {
    const routine = weeklyPlan[dayToStart] || defaultWeeklyPlan[dayToStart]
    if (!routine || routine.exercises.length === 0) {
      setWorkout(newSingleWorkout(selectedMuscle, selectedExercise))
    } else {
      setWorkout(newDayWorkout(routine))
    }
    setActiveExIdx(0)
    setTab("workout")
    notify(`Started ${dayToStart} workout`)
  }

  const startSingleWorkout = () => {
    setWorkout(newSingleWorkout(selectedMuscle, selectedExercise))
    setActiveExIdx(0)
    setTab("workout")
  }

  const updateWorkout = (next: Workout) => setWorkout(clone(next))

  const activeExercise = workout?.exercises[activeExIdx] ?? null

  const updateSet = (index: number, field: keyof SetEntry, value: number | boolean) => {
    if (!workout || !activeExercise) return
    const next = clone(workout)
    next.exercises[activeExIdx].sets[index] = { ...next.exercises[activeExIdx].sets[index], [field]: value }
    updateWorkout(next)
  }

  const addSet = () => {
    if (!workout || !activeExercise) return
    const next = clone(workout)
    next.exercises[activeExIdx].sets.push({ id: uid(), weight: 0, reps: 0, done: false })
    updateWorkout(next)
  }

  const removeSet = (index: number) => {
    if (!workout || !activeExercise || activeExercise.sets.length <= 1) return
    const next = clone(workout)
    next.exercises[activeExIdx].sets.splice(index, 1)
    updateWorkout(next)
  }

  const addExerciseToWorkout = (exName?: string, exMuscle?: string) => {
    if (!workout) return
    const name = exName || selectedExercise
    const muscle = exMuscle || selectedMuscle
    if (workout.exercises.some(e => e.name === name)) {
      return notify("Exercise already in this workout.")
    }
    const next = clone(workout)
    const ex: Exercise = { id: uid(), name, muscle, sets: [{ id: uid(), weight: 0, reps: 0, done: false }] }
    next.exercises.push(ex)
    updateWorkout(next)
    setActiveExIdx(next.exercises.length - 1)
    notify(`${name} added`)
  }

  const removeExerciseFromWorkout = (idx: number) => {
    if (!workout || workout.exercises.length <= 1) return notify("Need at least one exercise.")
    const next = clone(workout)
    next.exercises.splice(idx, 1)
    const newIdx = Math.min(activeExIdx, next.exercises.length - 1)
    setActiveExIdx(newIdx)
    updateWorkout(next)
  }

  const finishWorkout = () => {
    if (!workout) return
    const hasDone = workout.exercises.some(e => e.sets.some(s => s.done))
    if (!hasDone) return notify("Complete at least one set first.")
    const finished = { ...clone(workout), endedAt: new Date().toISOString() }
    setStore(s => ({ ...s, workouts: [finished, ...s.workouts.filter(w => w.id !== finished.id)] }))
    setWorkout(null)
    setTab("history")
    notify("Workout saved")
  }

  /* ── routine edit actions ─────────────────────────────────────── */
  const openEditRoutineModal = (day: WeekDay) => {
    const routine = weeklyPlan[day] || defaultWeeklyPlan[day]
    setEditingDay(day)
    setRoutineTitleInput(routine.title)
    setRoutineMusclesInput([...routine.muscles])
    setRoutineExercisesInput([...routine.exercises])
    setModal("editRoutine")
  }

  const saveRoutineChanges = () => {
    const updatedRoutine: DayRoutine = {
      day: editingDay,
      title: routineTitleInput.trim() || `${editingDay} Workout`,
      muscles: routineMusclesInput.length > 0 ? routineMusclesInput : ["FULL BODY"],
      exercises: routineExercisesInput
    }
    setStore(s => ({
      ...s,
      weeklyPlan: {
        ...(s.weeklyPlan || defaultWeeklyPlan),
        [editingDay]: updatedRoutine
      }
    }))
    setModal(null)
    notify(`${editingDay} routine updated`)
  }

  const toggleRoutineMuscle = (m: string) => {
    if (routineMusclesInput.includes(m)) {
      if (routineMusclesInput.length > 1) {
        setRoutineMusclesInput(routineMusclesInput.filter(x => x !== m))
      }
    } else {
      setRoutineMusclesInput([...routineMusclesInput, m])
    }
  }

  const addExerciseToRoutineDraft = (name: string, muscle: string) => {
    if (routineExercisesInput.some(e => e.name === name)) {
      return notify("Exercise already in routine.")
    }
    setRoutineExercisesInput([...routineExercisesInput, { name, muscle }])
    if (!routineMusclesInput.includes(muscle)) {
      setRoutineMusclesInput([...routineMusclesInput, muscle])
    }
  }

  const removeExerciseFromRoutineDraft = (name: string) => {
    setRoutineExercisesInput(routineExercisesInput.filter(e => e.name !== name))
  }

  /* ── previous performance lookup ──────────────────────────────── */
  const getPreviousPerformance = useCallback((exerciseName: string, currentWorkoutId?: string): SetEntry[] | null => {
    for (const w of store.workouts) {
      if (currentWorkoutId && w.id === currentWorkoutId) continue
      const ex = w.exercises.find(e => e.name === exerciseName)
      if (ex) {
        const doneSets = ex.sets.filter(s => s.done)
        if (doneSets.length > 0) return doneSets
      }
    }
    return null
  }, [store.workouts])

  /* ── food actions ─────────────────────────────────────────────── */
  const addFood = () => {
    const allFoods = [...foodDb, ...store.customFoods.map(f => ({ ...f, meal }))]
    const item = allFoods.find(f => f.name.toLowerCase() === foodName.toLowerCase())
    const q = Number(quantity)
    if (!item || !Number.isFinite(q) || q <= 0) return notify("Choose food and enter a valid quantity.")
    const c = calculateFood(item, q)
    const food: Food = {
      id: uid(), date: today(), meal, name: item.name, quantity: q, unit: "serving",
      calories: c.calories, protein: c.protein, caloriesPerUnit: item.calories, proteinPerUnit: item.protein
    }
    setStore(s => ({ ...s, foods: [...s.foods, food] }))
    setModal(null); setFoodName(""); setQuantity("1")
    notify("Food logged")
  }

  const deleteFood = (id: string) => {
    setStore(s => ({ ...s, foods: s.foods.filter(f => f.id !== id) }))
    notify("Food removed")
  }

  const deleteWeight = (id: string) => {
    setStore(s => ({ ...s, weights: s.weights.filter(w => w.id !== id) }))
    notify("Weight entry removed")
  }

  /* ── custom food actions ──────────────────────────────────────── */
  const addCustomFood = () => {
    const name = cfName.trim()
    const cal = Number(cfCalories)
    const prot = Number(cfProtein)
    if (!name) return notify("Enter food name.")
    if (!Number.isFinite(cal) || cal < 0) return notify("Enter valid calories.")
    if (!Number.isFinite(prot) || prot < 0) return notify("Enter valid protein.")
    if (store.customFoods.some(f => f.name.toLowerCase() === name.toLowerCase())) return notify("Food already exists.")
    setStore(s => ({ ...s, customFoods: [...s.customFoods, { name, calories: cal, protein: prot }] }))
    setModal(null); setCfName(""); setCfCalories(""); setCfProtein(""); setCfServing("")
    notify("Custom food saved")
  }

  /* ── weight action ────────────────────────────────────────────── */
  const addWeight = () => {
    const value = Number(weightInput)
    if (!Number.isFinite(value) || value <= 0 || value > 500) return notify("Enter a valid body weight.")
    const entry: BodyWeight = { id: uid(), date: today(), weight: value }
    setStore(s => ({ ...s, weights: [...s.weights.filter(w => w.date !== today()), entry] }))
    setModal(null); setWeightInput("")
    notify("Weight saved")
  }

  /* ── custom exercise action ───────────────────────────────────── */
  const addExercise = () => {
    const name = exerciseNameInput.trim()
    if (!name) return notify("Enter an exercise name.")
    if (exerciseList.includes(name)) return notify("Exercise already exists.")
    setStore(s => ({ ...s, customExercises: [...s.customExercises, { name, muscle: selectedMuscle }] }))
    setSelectedExercise(name)
    setModal(null); setExerciseNameInput("")
    notify("Exercise added")
  }

  /* ── edit workout from history ────────────────────────────────── */
  const editWorkout = (w: Workout) => {
    setWorkout(clone(w))
    setSelectedMuscle(w.exercises[0]?.muscle || "CHEST")
    setSelectedExercise(w.exercises[0]?.name ?? exercises.CHEST[0])
    setActiveExIdx(0)
    setHistoryItem(null)
    setTab("workout")
  }

  /* ── data backup actions ──────────────────────────────────────── */
  const doExport = () => {
    const blob = new Blob([exportStore(store)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `ironlog-backup-${today()}.json`; a.click()
    URL.revokeObjectURL(url)
    notify("Backup downloaded")
  }

  const doImport = () => {
    const input = document.createElement("input")
    input.type = "file"; input.accept = ".json"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = importStore(text)
        setStore(data)
        notify("Data imported successfully")
      } catch {
        notify("Invalid backup file.")
      }
    }
    input.click()
  }

  const doClear = () => {
    if (window.confirm("Delete ALL data? This cannot be undone.")) {
      setStore(blankStore())
      setWorkout(null)
      notify("All data cleared")
    }
  }

  /* ── PR detection ─────────────────────────────────────────────── */
  const getPRs = useMemo(() => {
    const prs: { exercise: string; type: string; value: string }[] = []
    const exerciseMap: Record<string, SetEntry[]> = {}
    for (const w of store.workouts) {
      for (const e of w.exercises) {
        if (!exerciseMap[e.name]) exerciseMap[e.name] = []
        exerciseMap[e.name].push(...e.sets.filter(s => s.done))
      }
    }
    for (const [name, sets] of Object.entries(exerciseMap)) {
      if (sets.length === 0) continue
      const maxWeight = Math.max(...sets.map(s => s.weight))
      const maxVolume = Math.max(...sets.map(s => s.weight * s.reps))
      if (maxWeight > 0) prs.push({ exercise: name, type: "Heaviest", value: `${maxWeight} kg` })
      if (maxVolume > 0) prs.push({ exercise: name, type: "Best Volume", value: `${maxVolume} kg` })
    }
    return prs.slice(0, 6)
  }, [store.workouts])

  /* ── average nutrition ────────────────────────────────────────── */
  const avgNutrition = useMemo(() => {
    const dates = [...new Set(store.foods.map(f => f.date))]
    if (dates.length === 0) return { calories: 0, protein: 0 }
    const totalCal = store.foods.reduce((a, f) => a + f.calories, 0)
    const totalProt = store.foods.reduce((a, f) => a + f.protein, 0)
    return { calories: Math.round(totalCal / dates.length), protein: Math.round(totalProt / dates.length) }
  }, [store.foods])

  /* ── today's workout info ─────────────────────────────────────── */
  const todaysWorkouts = useMemo(() => store.workouts.filter(w => w.date === today()), [store.workouts])

  /* ── greeting ─────────────────────────────────────────────────── */
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }, [])

  /* ── loading ──────────────────────────────────────────────────── */
  if (!ready) return <div className="app-shell"><main className="content"><p className="muted">Loading your log…</p></main></div>

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">I</span><span>IRONLOG</span></div>
        <div className="topbar-right"><span className="date-chip">{dateLabel}</span><CircleUserRound size={21} /></div>
      </header>

      <main className="content">
        {tab === "home" && (
          <HomeView
            totals={totals}
            weight={currentWeight}
            onTab={setTab}
            onStart={() => startDayRoutineWorkout(todayDay)}
            todaysWorkouts={todaysWorkouts}
            greeting={greeting}
            todayRoutine={todayRoutine}
            todayDay={todayDay}
          />
        )}

        {tab === "workout" && (
          <WorkoutView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            currentDayRoutine={currentDayRoutine}
            todayDay={todayDay}
            workout={workout}
            muscle={selectedMuscle}
            setMuscle={m => { setSelectedMuscle(m); setSelectedExercise((exercises[m] || [])[0] || "") }}
            exercise={selectedExercise}
            setExercise={setSelectedExercise}
            exerciseList={exerciseList}
            onStartDayWorkout={() => startDayRoutineWorkout(selectedDay)}
            onStartSingleWorkout={startSingleWorkout}
            onEditRoutine={() => openEditRoutineModal(selectedDay)}
            onSet={updateSet}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onFinish={finishWorkout}
            onCustom={() => setModal("exercise")}
            onAddExercise={addExerciseToWorkout}
            onRemoveExercise={removeExerciseFromWorkout}
            activeExIdx={activeExIdx}
            setActiveExIdx={setActiveExIdx}
            getPreviousPerformance={getPreviousPerformance}
            store={store}
          />
        )}

        {tab === "nutrition" && (
          <NutritionView
            foods={store.foods.filter(f => f.date === today())}
            totals={totals}
            onAdd={() => setModal("food")}
            onCustomFood={() => setModal("customFood")}
            onDeleteFood={deleteFood}
          />
        )}

        {tab === "progress" && (
          <ProgressView
            store={store}
            weight={currentWeight}
            onWeight={() => setModal("weight")}
            prs={getPRs}
            avgNutrition={avgNutrition}
            onData={() => setModal("data")}
            onDeleteWeight={deleteWeight}
          />
        )}

        {tab === "history" && (
          <HistoryView
            store={store}
            onOpen={setHistoryItem}
            onDelete={id => {
              if (window.confirm("Delete this workout?")) {
                setStore(s => ({ ...s, workouts: s.workouts.filter(w => w.id !== id) }))
              }
            }}
          />
        )}
      </main>

      {/* ── workout detail modal ──────────────────────────────────── */}
      {historyItem && (
        <div className="modal-backdrop" onClick={() => setHistoryItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><p className="eyebrow">WORKOUT DETAILS</p><h2>{historyItem.muscle}</h2></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="icon-button" onClick={() => editWorkout(historyItem)} aria-label="Edit workout"><Edit2 size={18} /></button>
                <button className="icon-button" onClick={() => setHistoryItem(null)}><X size={20} /></button>
              </div>
            </div>
            {historyItem.exercises.map(e => (
              <div className="food-row" key={e.id}>
                <div>
                  <strong>{e.name}</strong>
                  <small>{e.muscle} · {e.sets.filter(s => s.done).map(s => `${s.weight} × ${s.reps}`).join(" · ") || "No completed sets"}</small>
                </div>
                <b>{volume({ ...historyItem, exercises: [e] })} kg</b>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── edit day routine modal ────────────────────────────────── */}
      {modal === "editRoutine" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: "85vh", overflowY: "auto" }}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">CUSTOMIZE ROUTINE</p>
                <h2>{editingDay} Plan</h2>
              </div>
              <button className="icon-button" onClick={() => setModal(null)}><X size={20} /></button>
            </div>

            <label className="modal-label">
              Routine Title
              <input
                className="modal-input"
                value={routineTitleInput}
                onChange={e => setRoutineTitleInput(e.target.value)}
                placeholder="e.g. Push Day (Chest + Triceps)"
              />
            </label>

            <div style={{ marginTop: 12 }}>
              <span className="modal-label" style={{ marginBottom: 6 }}>Target Muscles</span>
              <div className="meal-pills">
                {muscles.map(m => (
                  <button
                    key={m}
                    className={routineMusclesInput.includes(m) ? "muscle active" : "muscle"}
                    onClick={() => toggleRoutineMuscle(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="section-heading">
                <h2>Planned Variations ({routineExercisesInput.length})</h2>
              </div>
              <div style={{ maxHeight: 160, overflowY: "auto", borderTop: "1px solid hsl(var(--border))" }}>
                {routineExercisesInput.map(e => (
                  <div className="food-row" key={e.name} style={{ padding: "10px 0" }}>
                    <div>
                      <strong>{e.name}</strong>
                      <small>{e.muscle}</small>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => removeExerciseFromRoutineDraft(e.name)}
                      aria-label={`Remove ${e.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {routineExercisesInput.length === 0 && (
                  <p className="muted" style={{ padding: "10px 0" }}>No exercises in this day&apos;s routine. Add some below!</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="section-heading">
                <h2>Add Variations</h2>
              </div>
              <div style={{ maxHeight: 180, overflowY: "auto", borderTop: "1px solid hsl(var(--border))" }}>
                {allExercises
                  .filter(e => !routineExercisesInput.some(re => re.name === e.name))
                  .map(e => (
                    <button
                      key={e.name}
                      className="food-option"
                      onClick={() => addExerciseToRoutineDraft(e.name, e.muscle)}
                    >
                      <span>{e.name}</span>
                      <small>{e.muscle}</small>
                      <Plus size={16} />
                    </button>
                  ))}
              </div>
            </div>

            <button className="primary-button wide-button" style={{ marginTop: 20 }} onClick={saveRoutineChanges}>
              Save {editingDay} Routine
            </button>
          </div>
        </div>
      )}

      {/* ── food modal ───────────────────────────────────────────── */}
      {modal === "food" && (
        <FoodModal
          query={foodQuery}
          setQuery={setFoodQuery}
          name={foodName}
          setName={setFoodName}
          meal={meal}
          setMeal={setMeal}
          quantity={quantity}
          setQuantity={setQuantity}
          onSave={addFood}
          onClose={() => setModal(null)}
          custom={store.customFoods}
        />
      )}

      {/* ── weight modal ─────────────────────────────────────────── */}
      {modal === "weight" && (
        <SimpleModal
          title="Log body weight"
          value={weightInput}
          setValue={setWeightInput}
          placeholder="kg"
          onSave={addWeight}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── exercise modal ───────────────────────────────────────── */}
      {modal === "exercise" && (
        <SimpleModal
          title="Add custom exercise"
          value={exerciseNameInput}
          setValue={setExerciseNameInput}
          placeholder="Exercise name"
          onSave={addExercise}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── custom food modal ────────────────────────────────────── */}
      {modal === "customFood" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><p className="eyebrow">NUTRITION</p><h2>Add custom food</h2></div>
              <button className="icon-button" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <label className="modal-label">Food name<input className="modal-input" autoFocus type="text" value={cfName} onChange={e => setCfName(e.target.value)} placeholder="e.g. Chicken breast" /></label>
            <label className="modal-label">Calories per serving<input className="modal-input" type="number" min="0" inputMode="decimal" value={cfCalories} onChange={e => setCfCalories(e.target.value)} placeholder="e.g. 165" /></label>
            <label className="modal-label">Protein per serving (g)<input className="modal-input" type="number" min="0" inputMode="decimal" value={cfProtein} onChange={e => setCfProtein(e.target.value)} placeholder="e.g. 31" /></label>
            <label className="modal-label">Serving size (optional)<input className="modal-input" type="text" value={cfServing} onChange={e => setCfServing(e.target.value)} placeholder="e.g. 100g" /></label>
            <button className="primary-button wide-button" onClick={addCustomFood}>Save food</button>
          </div>
        </div>
      )}

      {/* ── data backup modal ────────────────────────────────────── */}
      {modal === "data" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><p className="eyebrow">DATA</p><h2>Manage data</h2></div>
              <button className="icon-button" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="logger-actions">
              <button className="primary-button" onClick={doExport}><Download size={16} /> Export data</button>
              <button className="secondary-button" onClick={doImport}><Upload size={16} /> Import data</button>
              <button className="danger-button" onClick={doClear}><Trash2 size={16} /> Clear all data</button>
            </div>
          </div>
        </div>
      )}

      {/* ── toast ────────────────────────────────────────────────── */}
      {message && <div className="toast">{message}</div>}

      {/* ── bottom nav ───────────────────────────────────────────── */}
      <nav className="bottom-nav">
        {([
          ["home", LayoutDashboard, "Home"],
          ["workout", Dumbbell, "Workout"],
          ["nutrition", Utensils, "Nutrition"],
          ["progress", BarChart3, "Progress"],
          ["history", Activity, "History"],
        ] as const).map(([key, Icon, label]) => (
          <button className={tab === key ? "nav-item active" : "nav-item"} key={key} onClick={() => setTab(key)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ── HomeView ──────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */
function HomeView({ totals, weight, onTab, onStart, todaysWorkouts, greeting, todayRoutine, todayDay }: {
  totals: { calories: number; protein: number }; weight: number;
  onTab: (t: Tab) => void; onStart: () => void;
  todaysWorkouts: Workout[]; greeting: string;
  todayRoutine: DayRoutine; todayDay: WeekDay;
}) {
  const todayDone = todaysWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.done).length, 0), 0)
  const todayTotal = todaysWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0)
  const todayExercises = todaysWorkouts.flatMap(w => w.exercises)

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">{today().toUpperCase()}</p>
          <h1>{greeting}, Tharun<span className="accent">.</span></h1>
          <p className="muted">Ready to get stronger today?</p>
        </div>
        <div className="hero-orbit"><Flame size={23} /><strong>IRON</strong><small>CONSISTENCY</small></div>
      </section>

      <section className="metric-grid">
        <Metric label="Calories" value={`${totals.calories} / 2,200`} unit="KCAL" progress={totals.calories / 2200} icon={Flame} />
        <Metric label="Protein" value={`${totals.protein} / 80`} unit="GRAMS" progress={totals.protein / 80} icon={Activity} />
        <Metric label="Workouts" value={todaysWorkouts.length > 0 ? `${todaysWorkouts.length} TODAY` : "START TODAY"} unit="TRAINING" progress={todaysWorkouts.length > 0 ? 1 : 0} icon={Dumbbell} />
        <Metric label="Body weight" value={weight ? weight.toFixed(1) : "—"} unit="KG" progress={0} icon={Scale} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Today&apos;s workout ({todayDay})</h2>
          <button onClick={onTab.bind(null, "workout")}>View workout <ChevronRight size={15} /></button>
        </div>
        <div className="workout-card">
          <div className="workout-card-top">
            <div>
              <span className="tag">{todayRoutine.muscles.join(" + ")}</span>
              <h2>{todayDay} · {todayRoutine.title}</h2>
            </div>
            <div className="completion">{todayDone}<span>/{todayTotal || todayRoutine.exercises.length}</span><small>DONE</small></div>
          </div>
          {todayExercises.length > 0 ? (
            todayExercises.slice(0, 5).map(e => (
              <div className="exercise-row" key={e.id}>
                <span className={e.sets.some(s => s.done) ? "check done" : "check"}>
                  {e.sets.some(s => s.done) && <Check size={13} />}
                </span>
                <span>{e.name}</span>
                <ChevronRight size={16} className="row-arrow" />
              </div>
            ))
          ) : (
            todayRoutine.exercises.slice(0, 5).map(e => (
              <div className="exercise-row" key={e.name}>
                <span className="check" />
                <span>{e.name} <small style={{ color: "hsl(var(--muted))" }}>({e.muscle})</small></span>
                <ChevronRight size={16} className="row-arrow" />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Quick actions</h2></div>
        <div className="quick-actions">
          <button onClick={onStart}><Dumbbell size={19} /><span>Start {todayDay}</span><ArrowUpRight size={17} /></button>
          <button onClick={() => onTab("nutrition")}><Utensils size={19} /><span>Log food</span><ArrowUpRight size={17} /></button>
          <button onClick={() => onTab("progress")}><BarChart3 size={19} /><span>View progress</span><ArrowUpRight size={17} /></button>
        </div>
      </section>
    </>
  )
}

/* ── Metric card ──────────────────────────────────────────────────── */
function Metric({ label, value, unit, progress, icon: Icon }: { label: string; value: string; unit: string; progress: number; icon: typeof Flame }) {
  return (
    <div className="metric-card">
      <div className="metric-icon"><Icon size={17} /></div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{unit}</small>
      <div className="progress-track"><span style={{ width: `${Math.min(progress, 1) * 100}%` }} /></div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ── WorkoutView ───────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */
function WorkoutView({
  selectedDay, setSelectedDay, currentDayRoutine, todayDay,
  workout, muscle, setMuscle, exercise, setExercise, exerciseList,
  onStartDayWorkout, onStartSingleWorkout, onEditRoutine,
  onSet, onAddSet, onRemoveSet, onFinish, onCustom,
  onAddExercise, onRemoveExercise, activeExIdx, setActiveExIdx,
  getPreviousPerformance, store
}: any) {
  const activeEx: Exercise | null = workout?.exercises[activeExIdx] ?? null
  const sets: SetEntry[] = activeEx?.sets || []
  const prev = activeEx ? getPreviousPerformance(activeEx.name, workout?.id) : null
  const isEditing = workout && store.workouts.some((w: Workout) => w.id === workout.id)

  return (
    <>
      <PageTitle
        eyebrow="EVERYDAY WORKOUT TRACKER"
        title="Follow your split."
        subtitle="Plan and track multi-muscle routines for every day of the week."
      />

      {/* ── Day Selector (Monday to Sunday) ────────────────────── */}
      <div className="muscle-scroll">
        {weekDays.map(d => (
          <button
            className={selectedDay === d ? "muscle active" : "muscle"}
            onClick={() => setSelectedDay(d)}
            key={d}
          >
            {d === todayDay ? `★ ${d}` : d}
          </button>
        ))}
      </div>

      {/* ── Day Routine Overview Card ──────────────────────────── */}
      {!workout && (
        <section className="section-block" style={{ marginTop: 20 }}>
          <div className="workout-card">
            <div className="workout-card-top">
              <div>
                <span className="tag">{currentDayRoutine.muscles.join(" + ")}</span>
                <h2>{selectedDay} · {currentDayRoutine.title}</h2>
              </div>
              <button
                className="icon-button"
                onClick={onEditRoutine}
                title="Customize this day's routine"
                style={{ padding: 4 }}
              >
                <Settings2 size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              {currentDayRoutine.exercises.map((e: RoutineExercise) => (
                <div className="exercise-row" key={e.name} style={{ padding: "10px 0" }}>
                  <span className="check" />
                  <span>{e.name}</span>
                  <small style={{ marginLeft: "auto", color: "hsl(var(--muted))", fontSize: 11 }}>{e.muscle}</small>
                </div>
              ))}
              {currentDayRoutine.exercises.length === 0 && (
                <p className="muted">No exercises assigned to {selectedDay}. Click customize to add some!</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="primary-button" style={{ flex: 2 }} onClick={onStartDayWorkout}>
                <Dumbbell size={16} /> Start {selectedDay} Workout
              </button>
              <button className="secondary-button" style={{ flex: 1 }} onClick={onEditRoutine}>
                <Edit2 size={15} /> Customize
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Active Workout Section ─────────────────────────────── */}
      {workout ? (
        <>
          {/* Active Workout Info Bar */}
          <div style={{ marginTop: 24, padding: "12px 16px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="eyebrow" style={{ fontSize: 9 }}>IN-PROGRESS WORKOUT</span>
              <strong style={{ display: "block", fontSize: 16, marginTop: 2 }}>{workout.muscle}</strong>
            </div>
            <span className="date-chip">{workout.exercises.length} exercises</span>
          </div>

          {/* Exercise navigation tabs */}
          {workout.exercises.length > 0 && (
            <div className="muscle-scroll" style={{ marginTop: 14 }}>
              {workout.exercises.map((e: Exercise, i: number) => (
                <button
                  className={activeExIdx === i ? "muscle active" : "muscle"}
                  key={e.id}
                  onClick={() => setActiveExIdx(i)}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}

          {/* Active Exercise Logger Card */}
          {activeEx && (
            <section className="logger-card">
              <div className="logger-header">
                <div>
                  <span className="tag">{activeEx.muscle}</span>
                  <h2>{activeEx.name}</h2>
                  {prev && (
                    <div className="prev-perf">
                      <small className="muted">LAST TIME: {prev.map((s: SetEntry) => `${s.weight} kg × ${s.reps}`).join(" · ")}</small>
                    </div>
                  )}
                </div>
                <div className="last-time">
                  <small>VOLUME</small>
                  <strong>{sets.reduce((a: number, s: SetEntry) => a + (s.done ? s.weight * s.reps : 0), 0)} kg</strong>
                  {workout.exercises.length > 1 && (
                    <button className="icon-button" style={{ marginTop: 4 }} onClick={() => onRemoveExercise(activeExIdx)} aria-label="Remove exercise"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>

              <div className="set-head"><span>SET</span><span>KG</span><span>REPS</span><span>DONE</span></div>
              {sets.map((s: SetEntry, i: number) => (
                <div className="set-row" key={s.id}>
                  <span className="set-number">{i + 1}</span>
                  <input type="number" min="0" inputMode="decimal" value={s.weight || ""} placeholder="0" onChange={e => onSet(i, "weight", Math.max(0, Number(e.target.value)))} />
                  <input type="number" min="0" inputMode="numeric" value={s.reps || ""} placeholder="0" onChange={e => onSet(i, "reps", Math.max(0, Number(e.target.value)))} />
                  <button className={s.done ? "done-toggle checked" : "done-toggle"} onClick={() => onSet(i, "done", !s.done)}>
                    {s.done && <Check size={16} />}
                  </button>
                </div>
              ))}

              <div className="logger-actions">
                <button className="secondary-button" onClick={onAddSet}><Plus size={16} /> Add set</button>
                <button className="primary-button" onClick={onFinish}>{isEditing ? "Save changes" : "Finish workout"}</button>
              </div>
            </section>
          )}

          {/* Add extra variation to active session */}
          <section className="section-block" style={{ marginTop: 24 }}>
            <div className="section-heading">
              <h2>Add more variations to session</h2>
              <button onClick={onCustom}><Plus size={15} /> Custom</button>
            </div>
            <div className="muscle-scroll" style={{ marginBottom: 12 }}>
              {muscles.map((m: string) => (
                <button
                  className={muscle === m ? "muscle active" : "muscle"}
                  onClick={() => setMuscle(m)}
                  key={m}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="exercise-picker">
              {exerciseList.map((item: string) => (
                <button
                  className="exercise-choice"
                  onClick={() => onAddExercise(item, muscle)}
                  key={item}
                >
                  {item}<Plus size={16} />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Muscle library browser when not in active session */
        <section className="section-block" style={{ marginTop: 30 }}>
          <div className="section-heading">
            <h2>Browse Exercise Library ({muscle})</h2>
            <button onClick={onCustom}><Plus size={15} /> Custom</button>
          </div>
          <div className="muscle-scroll" style={{ marginBottom: 12 }}>
            {muscles.map((m: string) => (
              <button
                className={muscle === m ? "muscle active" : "muscle"}
                onClick={() => setMuscle(m)}
                key={m}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="exercise-picker">
            {exerciseList.map((item: string) => (
              <button
                className={exercise === item ? "exercise-choice active" : "exercise-choice"}
                onClick={() => setExercise(item)}
                key={item}
              >
                {item}<ChevronRight size={16} />
              </button>
            ))}
          </div>
          <button
            className="secondary-button wide-button"
            style={{ marginTop: 14 }}
            onClick={onStartSingleWorkout}
          >
            <Dumbbell size={16} /> Start with {exercise}
          </button>
        </section>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ── NutritionView ─────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */
function NutritionView({ foods, totals, onAdd, onCustomFood, onDeleteFood }: {
  foods: Food[]; totals: { calories: number; protein: number };
  onAdd: () => void; onCustomFood: () => void;
  onDeleteFood: (id: string) => void
}) {
  return (
    <>
      <PageTitle eyebrow="NUTRITION" title="Fuel your progress." subtitle="Track the food that supports your training." />

      <div className="nutrition-total">
        <div>
          <span className="tag">TODAY&apos;S TOTAL</span>
          <strong>{totals.calories} <small>/ 2,200 kcal</small></strong>
          <div className="big-progress"><span style={{ width: `${Math.min(totals.calories / 2200, 1) * 100}%` }} /></div>
        </div>
        <div className="protein-total">
          <strong>{totals.protein}g</strong>
          <small>/ 80g protein</small>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button className="primary-button add-food" style={{ flex: 1 }} onClick={onAdd}><Plus size={18} /> Add food</button>
        <button className="secondary-button add-food" style={{ flex: 1 }} onClick={onCustomFood}><Plus size={18} /> Custom food</button>
      </div>

      <section className="section-block">
        <div className="section-heading"><h2>Today&apos;s meals</h2></div>
        {foods.length ? foods.map(f => (
          <div className="food-row" key={f.id}>
            <div className="meal-dot" />
            <div><strong>{f.name}</strong><small>{f.meal} · {f.quantity} serving</small></div>
            <span>{f.calories} kcal<br /><b>{f.protein}g protein</b></span>
            <button className="icon-button" style={{ marginLeft: 8 }} onClick={() => onDeleteFood(f.id)} aria-label="Delete food item"><Trash2 size={15} /></button>
          </div>
        )) : <p className="muted">No food logged today.</p>}
      </section>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ── ProgressView ──────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */
function ProgressView({ store, weight, onWeight, prs, avgNutrition, onData, onDeleteWeight }: {
  store: Store; weight: number; onWeight: () => void;
  prs: { exercise: string; type: string; value: string }[];
  avgNutrition: { calories: number; protein: number };
  onData: () => void;
  onDeleteWeight: (id: string) => void;
}) {
  const workouts = store.workouts.length
  const vols = store.workouts.reduce((a, w) => a + volume(w), 0)
  const start = [...store.weights].sort((a, b) => a.date.localeCompare(b.date))[0]?.weight

  return (
    <>
      <PageTitle eyebrow="PROGRESS" title="Proof of the work." subtitle="Your real data, measured over time." />

      <div style={{ display: "flex", gap: 8 }}>
        <button className="primary-button add-food" style={{ flex: 1 }} onClick={onWeight}><Scale size={18} /> Log body weight</button>
        <button className="secondary-button add-food" style={{ flex: 1 }} onClick={onData}><Database size={18} /> Data</button>
      </div>

      <div className="stats-grid">
        <div><small>WORKOUTS</small><strong>{workouts}</strong><span>total logged</span></div>
        <div><small>VOLUME</small><strong>{vols.toLocaleString()}</strong><span>kg lifted</span></div>
        <div><small>BODY WEIGHT</small><strong>{weight ? `${weight.toFixed(1)}` : "—"}</strong><span>{start ? `${(weight - start).toFixed(1)} kg change` : "no history"}</span></div>
      </div>

      <div className="stats-grid" style={{ marginTop: 10 }}>
        <div><small>AVG CALORIES</small><strong>{avgNutrition.calories || "—"}</strong><span>kcal / day</span></div>
        <div><small>AVG PROTEIN</small><strong>{avgNutrition.protein || "—"}</strong><span>g / day</span></div>
        <div><small>FOOD DAYS</small><strong>{new Set(store.foods.map(f => f.date)).size}</strong><span>tracked</span></div>
      </div>

      {/* ── personal records ──────────────────────────────────── */}
      {prs.length > 0 && (
        <section className="section-block">
          <div className="section-heading"><h2>Personal records</h2></div>
          {prs.map((pr, i) => (
            <div className="record-row" key={i}>
              <div className="record-icon"><Trophy size={14} /></div>
              <div><strong>{pr.exercise}</strong><small>{pr.type}</small></div>
              <b>{pr.value}</b>
            </div>
          ))}
        </section>
      )}

      {/* ── weight history ────────────────────────────────────── */}
      <section className="section-block">
        <div className="section-heading"><h2>Weight history</h2></div>
        {store.weights.length ? [...store.weights].sort((a, b) => b.date.localeCompare(a.date)).map(w => (
          <div className="record-row" key={w.id}>
            <div><strong>{w.date}</strong><small>Body weight</small></div>
            <b>{w.weight} kg</b>
            <button className="icon-button" style={{ marginLeft: 8 }} onClick={() => onDeleteWeight(w.id)} aria-label="Delete weight entry"><Trash2 size={15} /></button>
          </div>
        )) : <p className="muted">Log your first weight to start tracking progress.</p>}
      </section>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ── HistoryView ───────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */
function HistoryView({ store, onOpen, onDelete }: { store: Store; onOpen: (w: Workout) => void; onDelete: (id: string) => void }) {
  return (
    <>
      <PageTitle eyebrow="HISTORY" title="Keep the receipts." subtitle="Every saved session, available offline." />
      {store.workouts.length ? store.workouts.map(w => (
        <div className="record-row history-row" key={w.id} onClick={() => onOpen(w)}>
          <div>
            <strong>{w.muscle}</strong>
            <small>{w.date} · {w.exercises.length} exercises · {volume(w)} kg volume</small>
          </div>
          <button className="icon-button" onClick={e => { e.stopPropagation(); onDelete(w.id) }} aria-label="Delete workout"><Trash2 size={17} /></button>
        </div>
      )) : <p className="muted">No saved workouts yet. Start your first session from Workout.</p>}
    </>
  )
}

/* ── PageTitle ─────────────────────────────────────────────────── */
function PageTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <section className="page-title"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{subtitle}</p></section>
}

/* ── SimpleModal ──────────────────────────────────────────────── */
function SimpleModal({ title, value, setValue, placeholder, onSave, onClose }: any) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div><p className="eyebrow">IRONLOG</p><h2>{title}</h2></div>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <input className="modal-input" autoFocus type={title.includes("weight") ? "number" : "text"} min="0" inputMode={title.includes("weight") ? "decimal" : "text"} value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} />
        <button className="primary-button wide-button" onClick={onSave}>Save</button>
      </div>
    </div>
  )
}

/* ── FoodModal ────────────────────────────────────────────────── */
function FoodModal({ query, setQuery, name, setName, meal, setMeal, quantity, setQuantity, onSave, onClose, custom }: any) {
  const options = [...foodDb, ...custom.map((f: any) => ({ ...f, meal: "Custom" }))].filter((f: any) => f.name.toLowerCase().includes(query.toLowerCase()))
  const selected = options.find((f: any) => f.name.toLowerCase() === name.toLowerCase())
  const q = Number(quantity) || 0
  const previewCal = selected ? Math.round(selected.calories * q) : 0
  const previewProt = selected ? Math.round(selected.protein * q) : 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><p className="eyebrow">NUTRITION</p><h2>Add food</h2></div>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <label className="search-field"><Search size={17} /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food" /></label>
        <div className="meal-pills">{mealTypes.map(m => <button className={meal === m ? "muscle active" : "muscle"} key={m} onClick={() => setMeal(m)}>{m}</button>)}</div>
        <div className="food-options">
          {options.map((f: any) => (
            <button className="food-option" key={f.name} onClick={() => setName(f.name)}>
              <span>{f.name}{name === f.name ? " ✓" : ""}</span>
              <small>{f.calories} kcal · {f.protein}g protein / serving</small>
              <Plus size={18} />
            </button>
          ))}
        </div>
        <label className="modal-label">Quantity<input className="modal-input" type="number" min="0.1" step="0.1" inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
        {selected && q > 0 && (
          <div style={{ padding: "8px 0", fontSize: 12, color: "hsl(151 78% 48%)" }}>
            ≈ {previewCal} kcal · {previewProt}g protein
          </div>
        )}
        <button className="primary-button wide-button" onClick={onSave}>Save food</button>
      </div>
    </div>
  )
}
