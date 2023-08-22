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
      muscleGroup
      date
      equipment
      workoutType
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

export const isConfigured = `
  query isUserConfigured {
    isUserConfigured 
  }
`;

export const getArchive = `
  query getWorkoutArchive($muscleGroup: String!){
    getWorkoutArchive(muscleGroup: $muscleGroup) {
      nextToken
      workouts {
        muscleGroup
        equipment
        estimatedTime
        workoutType
        workoutId
      }
    }
  }
`;

export const getWorkoutById = `
  query getWorkoutById($id: String!){
    getWorkoutById(id: $id) {
      muscleGroup
      equipment
      type
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
`

export const getWorkoutByDate = `
  query getWorkoutByDate($date: String!) {
    getWorkoutByDate(date: $date) {
      muscleGroup
      date
      equipment
      type
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