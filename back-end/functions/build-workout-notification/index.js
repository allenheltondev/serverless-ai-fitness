exports.handler = async (event) => {
  const { contactMethod, workout, metadata } = event;

  let message = '';
  const workoutDateSegments = metadata.date.split('-');
  const workoutDate = `${workoutDateSegments[1]}/${workoutDateSegments[2]}`;
  const subject = `${metadata.muscleGroup.charAt(0).toUpperCase() + metadata.muscleGroup.slice(1).toLowerCase()} Workout for ${workoutDate}`;
  if (contactMethod === 'email') {
    message += generateSection('Warmup', generateExerciseList(workout.warmup.exercises));
    message += generateSection('Main Set', generateSets(workout.mainSet.sets), workout.mainSet.numSets);
    message += generateSection('Abs', generateExerciseList(workout.abs.exercises), workout.abs.numSets);
    message += `<p><a href="${metadata.detailLink}">View online version</a></p>`;
  } else if (contactMethod === 'text') {
    message += generateSectionPlainText('Warmup', generateExerciseListPlainText(workout.warmup.exercises));
    message += generateSectionPlainText('Main Set', generateSetsPlainText(workout.mainSet.sets), workout.mainSet.numSets);
    message += generateSectionPlainText('Abs', generateExerciseListPlainText(workout.abs.exercises), workout.abs.numSets);
  }

  return { subject, message: message.trim() };
};

const generateSection = (title, content, numSets) => {
  return `
    <h2>${title} ${numSets ? ' - ' + numSets + ' rounds' : ''}</h2>
    ${content}
  `;
};

const generateExerciseList = (exercises) => {
  return `<ul>${exercises.map(exercise => `<li>${exercise.numReps ? exercise.numReps + 'x ' : ''}${exercise.name}</li>`).join('')}</ul>`;
};

const generateSets = (sets) => {
  let setsContent = '';

  sets.forEach((set, index) => {
    const setNumber = index + 1;
    setsContent += `
      <h3>Set ${setNumber} - ${set.numReps} reps</h3>
      ${generateExerciseList(set.exercises)}
    `;
  });

  return setsContent;
};

const generateSectionPlainText = (title, content, numSets) => {
  return `${title}${numSets ? ' - ' + numSets + ' rounds' : ''}:\n${content}`;
};

const generateExerciseListPlainText = (exercises) => {
  return exercises.map(exercise => `- ${exercise.numReps}x ${exercise.name}`).join('\n');
};

const generateSetsPlainText = (sets) => {
  let setsContent = '';

  sets.forEach((set, index) => {
    const setNumber = index + 1;
    setsContent += `Set ${setNumber} - ${set.numReps} reps each:\n${generateExerciseListPlainText(set.exercises)}\n`;
  });

  return setsContent;
};