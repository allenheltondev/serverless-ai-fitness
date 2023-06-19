let muscleGroups = ['chest', 'arm', 'shoulder', 'back', 'leg'];
let workoutTypes = [
  { description: 'circuit workout', shortDescription: 'Circuit'}, 
  { description: 'workout structured in supersets', shortDescription: 'Supersets'}, 
  { description: 'workout', shortDescription: 'Standard Workout'}
];

let equipment = [
  { type: 'barbells', threshold: .9 }, 
  { type: 'dumbbells', threshold: .75 }, 
  { type: 'kettlebells', threshold: .3 }, 
  { type: 'medicine balls', threshold: .3 }, 
  { type: 'battle ropes', threshold: .15 },
  { type: 'bodyweight exercises', threshold: .35 }
];

exports.handler = async (event) => {
  const muscleGroupOrder = shuffle(muscleGroups);;

  let workoutDate = new Date();
  const weekDetail = {
    startOfWeek: workoutDate.toISOString().split('T')[0],
    muscleGroups: muscleGroupOrder
  };

  const requests = [];
  const days = [];
  for (const mg of muscleGroupOrder) {
    const chatgptRequest = buildChatGptRequest(mg);
    workoutDate.setDate(workoutDate.getDate() + 1);
    requests.push({
      muscleGroup: mg,
      date: workoutDate.toISOString().split('T')[0],
      request: chatgptRequest.request
    });

    days.push(`<b>${workoutDate.toLocaleString('en-us', { weekday: 'long' })}:</b> ` +
      `${mg.charAt(0).toUpperCase() + mg.slice(1).toLowerCase()}${!['back', 'chest'].includes(mg) ? 's' : ''} - ${chatgptRequest.equipment} (${chatgptRequest.type})`);
  }

  weekDetail.email = composeWeeklyEmail(weekDetail.startOfWeek, days);

  return { weekDetail, requests };
};

const shuffle = (array) => {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const buildChatGptRequest = (muscleGroup) => {
  const workoutType = shuffle(workoutTypes)[0];
  let equipmentToUse = [];
  for (const equipmentPiece of equipment) {
    const randomNumber = Math.random();
    if (randomNumber <= equipmentPiece.threshold) {
      equipmentToUse.push(equipmentPiece.type);
    }
  }

  if (!equipmentToUse.length) {
    equipmentToUse.push(equipment[0].type);
  }


  equipmentToUse = pickThree(equipmentToUse);
  const workoutEquipment = joinWithAnd(equipmentToUse);
  const request = `Create ${muscleGroup == 'arm' ? `an arm` : `a ${muscleGroup}`} ${workoutType.description} that utilizes ${workoutEquipment}. I need the main set only. Ideally this workout takes about 40 minutes to complete and uses both traditional and creative exercises.`;

  return { type: workoutType.shortDescription, request, equipment: workoutEquipment };
};

const joinWithAnd = (array) => {
  let result = '';
  if (array.length == 1) {
    return array[0];
  }
  for (let i = 0; i < array.length; i++) {
    if (i === array.length - 1) {
      result += ', and ' + array[i];
    } else if (i === 0) {
      result += array[i];
    } else {
      result += ', ' + array[i];
    }
  }
  return result;
}

const composeWeeklyEmail = (startOfWeek, days) => {
  const email = {
    subject: `Weekly Workout Schedule for ${startOfWeek}`,
    html: `<p>Below is a glimpse of the excitement coming this week. <b>Get pumped!</b><p><ul>${days.map(day => `<li>${day}</li>`).join('')}</ul><p>Have a great week!</p>`
  }

  return email;
};

const pickThree = (arr) =>{
  const tempArr = arr.slice();
  const itemsToSelect = Math.min(3, tempArr.length);

  const selectedItems = [];
  for (let i = 0; i < itemsToSelect; i++) {
    const randomIndex = Math.floor(Math.random() * tempArr.length);
    selectedItems.push(tempArr.splice(randomIndex, 1)[0]);
  }

  return selectedItems;
}
