import { unmarshall } from '@aws-sdk/util-dynamodb';

const phases = {
  'muscle building': ['foundation', 'bulk', 'intensity', 'cutting', 'recovery'],
  'strength training': ['base', 'strength', 'peak', 'taper', 'maintenance'],
  'weight loss': ['foundation', 'progressive overload', 'high-intensity interval training', 'metabolic conditioning', 'plateau breaking', 'maintenance'],
  'building endurance': ['base building', 'build', 'intensity', 'peak', 'taper', 'recovery'],
  'stress reduction': ['foundation', 'mind-body integratin', 'aerobic conditioning', 'strength and flexibility', 'high-intensity interval training', 'relaxation and recovery', 'maintenance']
};

export const handler = async (state) => {
  const profile = unmarshall(state.profile);
  const profileClause = buildProfileClause(profile);
  const startDate = new Date().toISOString().split('T')[0];
  const prompt = `Come up with dates for a training program aimed at ${profile.objective} for a ${profileClause}starting on ${startDate}.
  The phases are: ${phases[profile.objective].join(', ')}. Answer with dates in ISO8601 format without the time and only in JSON.`;

  const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: 'object',
    properties: {
      phases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the phase of the workout program'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Start date of the phase in YYYY-MM-DD format'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Last day of the phase in YYYY-MM-DD format'
            }
          }
        }
      }
    }
  };

  return {
    prompt,
    schema,
    startDate,
    athleteDescription: profileClause.trim(),
    objective: profile.objective
  };
};

const buildProfileClause = (profile) => {
  if (!profile.demographics && !profile.experienceLevel) return '';

  let profileClause = '';
  if (profile.experienceLevel) {
    profileClause += `${profile.experienceLevel}-level `;
  }
  if (profile.demographics?.dob) {
    const birthday = new Date(profile.demographics.dob);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }

    profileClause += `${age}-year-old `;
  }
  if (profile.demographics?.sex) {
    profileClause += `${profile.demographics.sex} `;
  }
  profileClause += 'athlete ';
  if (profile.demographics?.weight) {
    profileClause += `weighing ${profile.demographics.weight} lbs `;
  }

  return profileClause;
};
