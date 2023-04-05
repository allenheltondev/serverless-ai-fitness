exports.handler = async (state) => {
  const workoutDate = new Date(state.workout.ScheduledDate.S);
  const subject = `${state.workout.muscleGroup.S.charAt(0).toUpperCase() + state.workout.muscleGroup.S.slice(1).toLowerCase()} Workout for ${workoutDate.toLocaleString('en-us', { weekday: 'long'})} (${workoutDate.getDate()}/${workoutDate.getMonth()})`;
  
  const message = `<h3>Warmup</h3>
  ${state.workout.warmup.S.replace(/\n/g, '<br>')} 
  <br>
  <h3>Main Set</h3>
  ${state.workout.workout.S.replace(/\n/g, '<br>')}
  <br>
  <h3>Closing Set</h3>
  ${state.workout.cooldown.S.replace(/\n/g, '<br>')}
  `;

  return { subject, message };
}