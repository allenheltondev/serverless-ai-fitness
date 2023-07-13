export const getMyProfile = `
  query getMyProfile {
    getMyProfile {
      demographics {
        firstName
        lastName
        dob
        sex
      }
      objective
      experienceLevel
      muscleGroups
      frequency
      targetTime
    }
  }
`;