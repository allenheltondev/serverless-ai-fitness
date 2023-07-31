export const updateProfile = `
  mutation updateProfile($input: ProfileInput!) {
    updateProfile(input: $input) 
  }
`;

export const updateSettings = `
  mutation updateSettings($input: SettingsInput!) {
    updateSettings(input: $input) 
  }
`;