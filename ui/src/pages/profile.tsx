import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Auth } from 'aws-amplify';
import { Authenticator, Text, TextField, Button, RadioGroupField, Radio, View, Flex, Heading, Image, Divider, SelectField, SliderField, CheckboxField, SwitchField } from '@aws-amplify/ui-react';

interface Profile {
  contact: {
    type: string;
    time: string;
    timezone: string;
  },
  demographics: {
    firstName: string;
    lastName: string;
    dob: string;
    sex: string;
  },
  objective: string,
  experienceLevel: string,
  targetTime: number,
  frequency: string[],
  muscleGroups: string[]
};

interface MuscleGroupTracker {
  isEnabled: boolean,
  count: number | undefined
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    contact: {
      type: 'email',
      time: '18:00',
      timezone: 'America/Chicago'
    },
    demographics: {
      firstName: '',
      lastName: '',
      dob: '',
      sex: ''
    },
    objective: '',
    experienceLevel: 'beginner',
    targetTime: 45,
    frequency: [],
    muscleGroups: []
  });

  const [isSundayChecked, setIsSundayChecked] = useState(false);
  const [isMondayChecked, setIsMondayChecked] = useState(false);
  const [isTuesdayChecked, setIsTuesdayChecked] = useState(false);
  const [isWednesdayChecked, setIsWednesdayChecked] = useState(false);
  const [isThursdayChecked, setIsThursdayChecked] = useState(false);
  const [isFridayChecked, setIsFridayChecked] = useState(false);
  const [isSatdayChecked, setIsSaturdayChecked] = useState(false);
  const [armTracker, setArmTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [backTracker, setBackTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [legTracker, setLegTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [shoulderTracker, setShoulderTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [chestTracker, setChestTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });
  const [cardioTracker, setCardioTracker] = useState<MuscleGroupTracker>({ isEnabled: false, count: undefined });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await Auth.currentAuthenticatedUser();
      // TODO: fetch user profile data from your database and update the state
    }
    fetchUserData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // TODO: call your API to save the profile data
  }

  const handleDemographicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
    setProfile(prev => ({ ...prev, demographics: { ...prev.demographics, [name]: value } }));
  }

  const handleRootFieldChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkoutDayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let newFrequency = [...profile.frequency];
    const index = newFrequency.indexOf(value);
    if (index == -1) {
      newFrequency.push(value);
    } else {
      newFrequency.splice(index, 1);
    }
    setProfile(prev => ({ ...prev, frequency: newFrequency }));
    toggleFrequencyCheckboxes(newFrequency);
  };

  const toggleFrequencyCheckboxes = (frequency: string[]) => {
    setIsSundayChecked(frequency.includes('Su'));
    setIsMondayChecked(frequency.includes('M'));
    setIsTuesdayChecked(frequency.includes('T'));
    setIsWednesdayChecked(frequency.includes('W'));
    setIsThursdayChecked(frequency.includes('Th'));
    setIsFridayChecked(frequency.includes('F'));
    setIsSaturdayChecked(frequency.includes('Sa'));
  };

  const updateProfile = async () => {
    profile.muscleGroups = calculateMuscleGroups();
  }

  const calculateMuscleGroups = () => {
    let muscleGroups: string[] = [];
    muscleGroups = addToArray(muscleGroups, 'arm', armTracker);
    muscleGroups = addToArray(muscleGroups, 'shoulder', shoulderTracker);
    muscleGroups = addToArray(muscleGroups, 'back', backTracker);
    muscleGroups = addToArray(muscleGroups, 'chest', chestTracker);
    muscleGroups = addToArray(muscleGroups, 'leg', legTracker);
    muscleGroups = addToArray(muscleGroups, 'cardio', cardioTracker);

    return muscleGroups;
  };

  const addToArray = (muscleGroups: string[], muscleGroupName: string, muscleGroup: MuscleGroupTracker) => {
    let count = muscleGroup.count ?? 0;
    for (let i = 0; i < count; i++) {
      muscleGroups.push(muscleGroupName)
    }

    return muscleGroups;
  };

  return (

    <Flex direction="column">
      <Flex direction="row" justifyContent="space-between" paddingRight="2em">
        <Flex direction="column" width="60%">
          <Heading level={4}>Tell us about yourself</Heading>
          <View className="mt-3">
            <Flex direction="column" gap="1em">
              <TextField label="First Name" required value={profile.demographics.firstName} onChange={handleDemographicChange} />
              <TextField label="Last Name" required value={profile.demographics.lastName} onChange={handleDemographicChange} />
              <TextField label="Date of Birth" value={profile.demographics.dob} width="30%" onChange={handleDemographicChange} />
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
              <SliderField
                name="targetTime"
                label="Preferred workout length"
                value={profile.targetTime}
                min={15}
                max={90}
                width="50%"
                onChange={(e: number) => setProfile(prev => ({ ...prev, targetTime: e }))}
              />
            </Flex>
            <Divider margin="1em .5em" />
            <Text marginBottom=".3em">Workout Days</Text>
            <Flex direction="row" gap=".7em">
              <CheckboxField label="Sunday" name="su" value="Su" checked={isSundayChecked} onChange={handleWorkoutDayChange} />
              <CheckboxField label="Monday" name="m" value="M" checked={isMondayChecked} onChange={handleWorkoutDayChange} />
              <CheckboxField label="Tuesday" name="t" value="T" checked={isTuesdayChecked} onChange={handleWorkoutDayChange} />
              <CheckboxField label="Wednesday" name="w" value="W" checked={isWednesdayChecked} onChange={handleWorkoutDayChange} />
              <CheckboxField label="Thursday" name="th" value="Th" checked={isThursdayChecked} onChange={handleWorkoutDayChange} />
              <CheckboxField label="Friday" name="f" value="F" checked={isFridayChecked} onChange={handleWorkoutDayChange} />
              <CheckboxField label="Saturday" name="sa" value="Sa" checked={isSatdayChecked} onChange={handleWorkoutDayChange} />
            </Flex>
            <Flex direction="row" justifyContent="space-between" gap="2em">
              <Flex direction="column" basis="50%">
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Arms"
                    labelPosition="end"
                    checked={armTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setArmTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!armTracker.isEnabled}
                    placeholder="Times per week"
                    value={armTracker.count}
                    max="7"
                    onChange={(e) => { setArmTracker({ ...armTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Chest"
                    labelPosition="end"
                    checked={chestTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setChestTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!chestTracker.isEnabled}
                    placeholder="Times per week"
                    value={chestTracker.count}
                    max="7"
                    onChange={(e) => { setChestTracker({ ...armTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Shoulders"
                    labelPosition="end"
                    checked={shoulderTracker.isEnabled}
                    width="8em"
                    onChange={(e) => { setShoulderTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!shoulderTracker.isEnabled}
                    placeholder="Times per week"
                    value={shoulderTracker.count}
                    max="7"
                    onChange={(e) => { setShoulderTracker({ ...shoulderTracker, count: Number(e.target.value) }) }} />
                </Flex>
              </Flex>
              <Flex direction="column" basis="50%">
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Back"
                    labelPosition="end"
                    checked={backTracker.isEnabled}
                    width="6em"
                    onChange={(e) => { setBackTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!backTracker.isEnabled}
                    placeholder="Times per week"
                    value={backTracker.count}
                    max="7"
                    onChange={(e) => { setBackTracker({ ...backTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Legs"
                    labelPosition="end"
                    checked={legTracker.isEnabled}
                    width="6em"
                    onChange={(e) => { setLegTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!legTracker.isEnabled}
                    placeholder="Times per week"
                    value={legTracker.count}
                    max="7"
                    onChange={(e) => { setLegTracker({ ...legTracker, count: Number(e.target.value) }) }} />
                </Flex>
                <Flex direction="row" gap="1em" alignItems="center" marginTop=".7em">
                  <SwitchField
                    label="Cardio"
                    labelPosition="end"
                    checked={cardioTracker.isEnabled}
                    width="6em"
                    onChange={(e) => { setCardioTracker({ isEnabled: e.target.checked, count: e.target.checked ? 1 : 0 }) }} />
                  <TextField
                    type="number"
                    label=""
                    isDisabled={!cardioTracker.isEnabled}
                    placeholder="Times per week"
                    value={cardioTracker.count}
                    max="7"
                    onChange={(e) => { setCardioTracker({ ...cardioTracker, count: Number(e.target.value) }) }} />
                </Flex>
              </Flex>
            </Flex>
            <Button type="submit" onClick={updateProfile}>Save</Button>
          </View>
        </Flex>
        <Image src="https://readysetcloud.s3.amazonaws.com/profile.png" height="15em" borderRadius="50%" alt="man lifting barbell over his head" />
      </Flex>
    </Flex>

  );
};

export default ProfilePage;
