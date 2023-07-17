import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Auth, API } from 'aws-amplify';
import { Text, TextField, Button, RadioGroupField, Radio, View, Flex, Heading, Image, Divider, SelectField, SliderField, CheckboxField, SwitchField } from '@aws-amplify/ui-react';
import { getMyProfile } from '@/graphql/queries';
import { updateProfile } from '@/graphql/mutations';
import moment from 'moment-timezone';

interface Profile {
  contact: {
    type: string;
    time: string;
    timezone: string;
    email: string;
  },
  demographics: {
    firstName: string;
    lastName: string;
    username: string;
    dob: string;
    sex: string;
    weight: number
  },
  objective: string,
  experienceLevel: string
};

interface GetProfileResponse {
  data: {
    getMyProfile: Profile
  }
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    contact: {
      type: 'email',
      time: '18:00',
      timezone: 'America/Chicago',
      email: ''
    },
    demographics: {
      firstName: '',
      lastName: '',
      username: '',
      dob: '',
      sex: '',
      weight: 0
    },
    objective: 'weight loss',
    experienceLevel: 'beginner'
  });

  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    setTimezones(moment.tz.names());
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const profile = await API.graphql<GetProfileResponse>({ query: getMyProfile });
      setProfile(profile.data.getMyProfile);
    }

    fetchUserData();
  }, []);

  const handleDemographicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, demographics: { ...prev.demographics, [name]: value } }));
  };

  const handleRootFieldChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, contact: { ...prev.contact, [name]: value } }));
  };

  const updateMyProfile = async () => {
    const response = await API.graphql({
      query: updateProfile,
      variables: {
        input: profile
      }
    });

    console.log(response);
  };

  return (
    <Flex direction="column">
      <Flex direction="row" justifyContent="space-between" paddingRight="2em">
        <Flex direction="column" width="60%">
          <Heading level={4}>Tell us about yourself</Heading>
          <View className="mt-3">
            <Flex direction="column" gap="1em" marginBottom="1em">
              <TextField label="First Name" name="firstName" required value={profile.demographics.firstName} onChange={handleDemographicChange} />
              <TextField label="Last Name" name="lastName" required value={profile.demographics.lastName} onChange={handleDemographicChange} />
              <TextField label="Display Name" name="username" required value={profile.demographics.username} onChange={handleDemographicChange} />
              <Flex direction="row" gap="1em">
                <TextField label="Date of Birth" type="date" name="dob" value={profile.demographics.dob} width="30%" onChange={handleDemographicChange} />
                <TextField label="Weight (lbs)" name="weight" type="number" value={profile.demographics.weight} width="30%" onChange={handleDemographicChange} />
              </Flex>
              <RadioGroupField label="" name="sex" direction="row" value={profile.demographics.sex} onChange={handleDemographicChange}>
                <Radio value="male">Male</Radio>
                <Radio value="femail">Female</Radio>
                <Radio value="other">Other</Radio>
              </RadioGroupField>
              <Divider margin="1em .5em" />
              <SelectField label="Experience level" name="experienceLevel" value={profile.experienceLevel} onChange={handleRootFieldChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </SelectField>
              <SelectField label="Current objective" name="objective" value={profile.objective} onChange={handleRootFieldChange}>
                <option value="muscle building">Muscle building</option>
                <option value="strength training">Increase strength</option>
                <option value="weight loss">Lose weight</option>
                <option value="building endurance">Build endurance</option>
                <option value="stress reduction">Reduce stress</option>
              </SelectField>
              <Divider margin="1em .5em" />
              <Heading level={5}>Notifications</Heading>
              <Text><i>You have the option of receiving your workouts via email the day before. Configure the settings below if you'd like to get them.</i></Text>
              <RadioGroupField label="Contact Type" name="type" direction="row" value={profile.contact.type} onChange={handleContactChange}>
                <Radio value="email">Email</Radio>
                <Radio value="none">None</Radio>
              </RadioGroupField>
              <TextField label="Email address" name="email" isDisabled={profile.contact.type == "none"} type="email" required value={profile.contact.email} onChange={handleContactChange} />
              <Flex direction="row" gap="1em">
                <TextField label="Notification Time" name="time" isDisabled={profile.contact.type == "none"} type="time" required value={profile.contact.time} onChange={handleContactChange} />
                <SelectField label="Timezone" name="timezone" isDisabled={profile.contact.type == "none"} value={profile.contact.timezone} onChange={(e) => setProfile(prev => ({ ...prev, contact: { ...prev.contact, timezone: e.target.value } }))}>
                  {timezones.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </SelectField>
              </Flex>
            </Flex>
            <Button type="submit" onClick={updateMyProfile}>Save</Button>
          </View>
        </Flex>
        <Image src="https://readysetcloud.s3.amazonaws.com/profile.png" height="15em" borderRadius="50%" alt="man lifting barbell over his head" />
      </Flex>
    </Flex>

  );
};

export default ProfilePage;
