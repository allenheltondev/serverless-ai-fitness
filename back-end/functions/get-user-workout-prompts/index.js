const { unmarshall } = require('@aws-sdk/util-dynamodb');

const PROFILE_DEFAULTS = {
  objective: 'weight loss',
  experienceLevel: 'beginner',
  contact: {
    time: '18:00'
  }
};

const SETTINGS_DEFAULTS = {
  equipment: [{ type: 'bodyweight', threshold: 1 }],
  targetTime: 30,
  workoutTypes: [{ type: 'circuit' }],
  frequency: ['M', 'W', 'F'],
  muscleGroups: ['total body']
};

exports.handler = async (state) => {
  let profile = state.profile;
  let settings = state.settings;
  if (state.unmarshall) {
    profile = unmarshall(profile);
    settings = unmarshall(settings);
  }

  profile = { ...PROFILE_DEFAULTS, ...profile };
  settings = { ...SETTINGS_DEFAULTS, ...settings };

  const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  const workouts = [];
  let muscleGroups = shuffleArray([...settings.muscleGroups]);
  const currentDate = new Date();
  currentDate.setUTCDate(currentDate.getUTCDate() - currentDate.getUTCDay());

  for (let i = 0; i < 7; i++) {
    const day = days[i];
    if (settings.frequency.includes(day)) {
      const muscleGroup = muscleGroups.pop();
      if (!muscleGroups.length) {
        muscleGroups = shuffleArray([...settings.muscleGroups]);
      }
      const workout = createWorkoutPrompt(day, settings.equipment, profile.experienceLevel ?? 'beginner', profile.objective, settings.workoutTypes ?? [{ type: 'standard' }], muscleGroup, settings.targetTime, settings.specialWorkouts);
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      workout.date = date.toISOString();

      const notificationDate = new Date(date);
      notificationDate.setDate(notificationDate.getDate() - 1);
      workout.notificationDate = `${notificationDate.toISOString().split('T')[0]}T${profile.contact.time}:00`;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight

      notificationDate.setHours(0, 0, 0, 0); // Set time to midnight
      if (notificationDate.getTime() >= currentDate.getTime()) {
        workout.canSendNotification = true;
      } else {
        workout.canSendNotification = false;
      }

      workouts.push(workout);
    }
  }

  return workouts.map(w => formatWorkout(w));
};

const createWorkoutPrompt = (day, equipment, experienceLevel, objective, workoutTypes, muscleGroup, targetTime, specialWorkouts) => {
  const workout = {
    day,
    muscleGroup,
    experienceLevel,
    targetTime,
    objective,
    equipment: getEquipment(equipment),
    workoutType: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
    difficulty: experienceLevel
  };

  const isSpecialDay = isSpecialWorkoutDay(specialWorkouts, day);
  if (isSpecialDay && Math.random() <= specialWorkouts.percentChance / 100) {
    workout.equipment = [specialWorkouts.equipment[Math.floor(Math.random() * specialWorkouts.equipment.length)]];
    workout.objective = specialWorkouts.objective;
    delete workout.workoutType;
    workout.muscleGroup = 'special workout';
  }

  workout.prompt = `Create a ${workout.workoutType?.type || ''} workout ${workout.workoutType?.modifier || ''} for ` +
    `${workout.objective} ${workout.workoutType ? 'targeting the ' + workout.muscleGroup : ''} using ${workout.equipment.join(', ')}.` +
    ` It should be a ${workout.experienceLevel}-level workout that takes ${workout.targetTime} minutes to complete the main set. ` +
    `Also create a dynamic warmup with 6 or more related exercises for this workout and an ab set with related moves for afterward.`;

  return workout;
};

const isSpecialWorkoutDay = (specialWorkouts, day) => specialWorkouts?.days.find(d => d == day);

const getEquipment = (equipment) => {
  if (!equipment || equipment.length === 0) {
    return ['bodyweight'];
  }

  const shuffledEquipment = [...equipment].sort(() => 0.5 - Math.random());
  const numberOfEquipment = Math.min(Math.floor(Math.random() * 3) + 1, shuffledEquipment.length);

  return shuffledEquipment.slice(0, numberOfEquipment).map(item => item.type);
};


const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const formatWorkout = (workout) => {
  return {
    date: workout.date.split('T')[0],
    notificationDate: workout.notificationDate,
    canSendNotification: workout.canSendNotification,
    muscleGroup: workout.muscleGroup,
    equipment: workout.equipment.join(', '),
    workoutType: workout.workoutType?.type || 'special workout',
    prompt: workout.prompt,
    targetTime: workout.targetTime,
    difficulty: workout.difficulty
  };
};