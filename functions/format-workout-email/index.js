exports.handler = async (state) => {
  const subject = `${state.workout.muscleGroup.S.charAt(0).toUpperCase() + state.workout.muscleGroup.S.slice(1).toLowerCase()} Workout for ${state.workout.ScheduledDate.S}`;
  let detail = state.workout.workout.S.replace(/\n/g, '<br>');

  const workoutDate = new Date(state.workout.ScheduledDate.S);
  const message = `<h3>Here is your ${state.workout.muscleGroup.S} workout for ${workoutDate.toLocaleString('en-us', { weekday: 'long' })}</h3>${detail}`;

  return { subject, message };
}