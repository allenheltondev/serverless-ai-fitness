import { unmarshall } from '@aws-sdk/util-dynamodb';
const FIGHTING_WORKOUTS = ['boxing', 'kickboxing'];

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

export const handler = async (state) => {
  let profile = state.profile;
  let settings = state.settings;
  let trainingPlan = state.trainingPlan;
  if (state.unmarshall) {
    profile = unmarshall(profile);
    settings = unmarshall(settings);
    if (trainingPlan?.Item) {
      trainingPlan = unmarshall(trainingPlan.Item);
    }
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
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      const workoutDate = date.toISOString();
      const workout = createWorkoutPrompt(day, settings.equipment, profile.experienceLevel ?? 'beginner', profile.objective, settings.workoutTypes ?? [{ type: 'standard' }], muscleGroup, settings.targetTime, workoutDate, trainingPlan);

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

const createWorkoutPrompt = (day, equipment, experienceLevel, objective, workoutTypes, muscleGroup, targetTime, workoutDate, trainingPlan) => {
  const workout = {
    day,
    date: workoutDate,
    muscleGroup,
    experienceLevel,
    targetTime,
    objective,
    equipment: getEquipment(equipment),
    workoutType: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
    difficulty: experienceLevel
  };

  let prompt;
  if (FIGHTING_WORKOUTS.includes(workout.muscleGroup)) {
    prompt = getFightingPrompt(workout);
  } else {
    prompt = getWeightPrompt(workout);
  }

  if (trainingPlan) {
    prompt += ` ${getTrainingPlanClause(trainingPlan)}`;
  }

  workout.prompt = prompt;
  return workout;
};

const getWorkoutTypeDescription = (type) => {
  switch (type?.toLowerCase()) {
    case 'superset':
      return 'in supersets';
    case 'circuit':
      return 'as a circuit';
    case 'hiit':
      return 'as a high-intensity interval session';
    case 'emom':
      return 'as an every-minute-on-the-minute workout';
    case 'amrap':
      return 'as an as-many-rounds-as-possible workout';
    default:
      return 'as a standard workout';
  };
};

const getObjectiveDescription = (objective) => {
  switch (objective?.toLowerCase()) {
    case 'muscle building':
      return 'hypertrophy';
    case 'strength training':
      return 'muscular strength training';
    case 'weight loss':
      return 'fat loss';
    case 'building endurance':
      return 'cardiovascular endurance training';
    case 'stress reduction':
      return 'stress management';
    default:
      return objective ?? '';
  }
};

const getEquipment = (equipment) => {
  if (!equipment || equipment.length === 0) {
    return 'bodyweight';
  }

  return equipment.map(e => e.type).join(', ');
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
    workoutType: workout.workoutType?.type || 'normal workout',
    prompt: workout.prompt,
    targetTime: workout.targetTime,
    difficulty: workout.difficulty
  };
};


const getWeightPrompt = (workout) => {
  return `Create a ${workout.muscleGroup} workout structured ${getWorkoutTypeDescription(workout.workoutType?.type)} designed for
  ${getObjectiveDescription(workout.objective)}. I have ${workout.equipment} as available equipment but you don't have to use everying.
  Include what equipment you used in your response as a comma separated list. This should be a ${workout.experienceLevel}-level workout that
  takes about ${workout.targetTime} minutes to complete the main set. Include at least 1 uncommon exercise in the workout. Also create a dynamic
  calisthenic warmup with 6 or more related exercises for this workout and an ab set with 5 or more exercises for afterward. Abs should be
  varied from other workouts you created for maximum effectiveness.`;
};

const getFightingPrompt = (workout) => {
  return `Create a ${workout.muscleGroup} workout for a ${workout.experienceLevel}-level athlete that takes ${workout.targetTime} for the main set.
  Only include equipment from this list and/or bodyweight (but you don't have to use all equipment): ${workout.equipment}. Be specific about the combos you describe as "exercises".
  Create a relevant calisthenic warmup and unique ab set cooldown. Vary the abs from other workouts.`;
};

const getTrainingPlanClause = (trainingPlan, date) => {
  const phases = trainingPlan.phases.map(p => `${p.name}: ${p.startDate} - ${p.endDate}`).join('\n');

  const prompt = `
  This workout is part of a ${trainingPlan.objective} training plan that started on ${trainingPlan.startDate}. Today is ${date}.
  This is for a ${trainingPlan.athleteDescription}.
  The program phases are:
${phases}`;

  return prompt;
};
