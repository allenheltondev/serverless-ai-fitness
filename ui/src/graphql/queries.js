export const getMyProfile = `
  query getMyProfile {
    getMyProfile {
      contact {
        type
        email
        time
        timezone
      }
      demographics {
        firstName
        lastName
        username
        dob
        sex
        weight
      }
      objective
      experienceLevel      
    }
  }
`;

export const getWorkoutSettings = `
  query getMySettings {
    getMySettings {
      muscleGroups
      frequency
      targetTime
      workoutTypes {
        type
        modifier
      }
      equipment {
        type
        threshold
      }
      specialWorkouts {
        days
        percentChance
        equipment
        objective
      }
    }
  }
`;

export const getWorkout = `
  query getUserWorkout($date: String!) {
    getUserWorkout(date: $date) {
      workout {
        warmup {
          exercises {
            name
            numReps
          }
        }
        mainSet {
          numSets
          setType
          sets {
            numReps
            exercises {
              name            
            }
          }
        }
        abs {
          numSets
          exercises {
            name
            numReps
          }
        }
      }
    }
  }
`;


export const getWorkoutList = `
  query getWorkoutList($date: String!) {
    getWorkoutList(date: $date) {
      workouts {
        muscleGroup
        equipment
        date
        workoutType
      }
    }
  }
`;