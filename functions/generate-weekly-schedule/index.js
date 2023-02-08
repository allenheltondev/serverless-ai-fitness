let muscleGroups = ['chest', 'arm', 'shoulder', 'back', 'leg'];
let workoutTypes = ['as a circuit', 'in supersets', 'as a standard workout'];
let equipment = [{ type: 'barbells', threshold: .9 }, { type: 'dumbbells', threshold: .75 }, { type: 'kettlebells', threshold: .45 }, { type: 'medicine balls', threshold: .3 }];

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
      `${mg.charAt(0).toUpperCase() + mg.slice(1).toLowerCase()}${mg != 'back' ? 's' : ''} ${chatgptRequest.type}`);
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
  const equipmentToUse = [];
  for (const equipmentPiece of equipment) {
    const randomNumber = Math.random();
    if (randomNumber <= equipmentPiece.threshold) {
      equipmentToUse.push(equipmentPiece.type);
    }
  }

  if (!equipmentToUse.length) {
    equipmentToUse.push(equipment[0].type);
  }

  const request = `Create a ${muscleGroup} workout for strength training that uses ${joinWithAnd(equipmentToUse)} structured ${workoutType}.`;

  return { type: workoutType, request };
};

const joinWithAnd = (array) => {
  let result = '';
  if (array.length == 1) {
    return array[0];
  }
  for (let i = 0; i < array.length; i++) {
    if (i === array.length - 1) {
      result += ' and ' + array[i];
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