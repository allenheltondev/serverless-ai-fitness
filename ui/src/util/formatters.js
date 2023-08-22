import equipment from '../../lib/Equipment';
import workoutTypes from '../../lib/WorkoutTypes';

export const getWorkoutEquipment = (workout) => {
  const allEquipment = workout.equipment.split(',');
  const formattedEquipment = allEquipment.map(e => {
    return equipment.find(equip => equip.value == e.trim())?.name
  });

  return combineWithAnd(formattedEquipment);
};

const combineWithAnd = (strings) => {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];
  if (strings.length === 2) return strings.join(' and ');

  const allButLast = strings.slice(0, -1).join(', ');
  const last = strings[strings.length - 1];

  return `${allButLast}, and ${last}`;
};

export const getWorkoutHeading = (workout, date) => {
  const header = `${workout.muscleGroup} ${workoutTypes.find(wt => wt.value == workout.workoutType)?.name ?? workoutTypes.find(wt => wt.value == workout.type)?.name} Workout ${date ? '- ' + new Date(date + 'T23:59:59').toLocaleDateString() : ''}`;
  return toTitleCase(header);
};

const toTitleCase = (unformatted) => {
  return unformatted.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
