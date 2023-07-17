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
  query getWorkoutSettings {
    getSettings {
      muscleGroups
      frequency
      targetTime
    }
  }
`;