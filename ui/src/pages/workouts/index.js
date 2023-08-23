import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Authenticator, Card, Heading, Text, Flex, Loader, Link, Alert, SelectField } from '@aws-amplify/ui-react';
import { getArchive } from '../../graphql/queries';
import { API } from 'aws-amplify';
import muscleGroupList from '../../../lib/MuscleGroups';
import workoutTypes from '../../../lib/WorkoutTypes';

const WorkoutArchivePage = ({ signout, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [nextToken, setNextToken] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      await loadWorkouts();
      setLoading(false);
    };
    if (selectedMuscleGroup) {
      fetchWorkouts();
    } else {
      setWorkouts([]);
    }
  }, [selectedMuscleGroup]);

  useEffect(() => {
    if(router.query.muscleGroup){
      setSelectedMuscleGroup(router.query.muscleGroup);
    }
  }, [router.query]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      isMounted.current = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [workouts, nextToken]);

  const loadWorkouts = async (append = false) => {
    try {
      const workoutResponse = await API.graphql({
        query: getArchive,
        variables: {
          muscleGroup: selectedMuscleGroup,
          ...(nextToken && append) && { nextToken }
        }
      });

      let workoutList = [];
      if (append && nextToken) {
        workoutList = workoutList.concat(workouts);
      }
      workoutList = workoutList.concat(workoutResponse?.data?.getWorkoutArchive?.workouts ?? []);
      console.log(workoutList)
      setWorkouts(workoutList);
      setNextToken(workoutResponse?.data?.getWorkoutArchive?.nextToken);
    } catch (err) {
      console.log(err)
    }
  }

  const combineWithAnd = (strings) => {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    if (strings.length === 2) return strings.join(' and ');

    const allButLast = strings.slice(0, -1).join(', ');
    const last = strings[strings.length - 1];

    return `${allButLast}, and ${last}`;
  };

  const isAtBottom = () => {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
  };

  const handleScroll = () => {
    if (isAtBottom() && nextToken && isMounted.current) {
      loadWorkouts(true);
    }
  };


  return (
    <Authenticator socialProviders={["google"]}>
      {({ signOut, user }) => (
        <Flex direction="column" width="100%">
          <Head>
            <title>Browse Workouts | Ready, Set, Cloud Fitness!</title>
          </Head>
          <Alert backgroundColor={"var(--primary)"} hasIcon={false} isDismissible={false}>
            <Heading level={5} color="white">Browse our workout list</Heading>
            <Text color="white">Select a muscle group to view a list of workouts in our database</Text>
          </Alert>
          <SelectField value={selectedMuscleGroup} onChange={(e) => setSelectedMuscleGroup(e.target.value)}>
            <option key="blank" value="">Select a muscle group...</option>
            {muscleGroupList.map(mg => (
              <option key={mg.value} value={mg.value}>{mg.name}</option>
            ))}
          </SelectField>
          {loading && (
            <Flex direction="column" alignItems="center" justifyContent="center" >
              <Loader size="large" />
            </Flex>
          )}
          {(!loading && workouts.length) && (
            <Flex direction="column" >
              {workouts.map((workout, index) => (
                <Card variation="elevated" width="100%" key={index} style={{ cursor: "pointer" }} onClick={() => router.push(`/workouts/${workout.id}`)}>
                  <Flex direction="column" gap=".5em" >
                    <Text fontSize="1.1em"><b>{`${workoutTypes.find(wt => wt.value == workout.type)?.name ?? 'Mystery'} Workout - ${workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)} Level - ${workout.estimatedTime} minutes`}</b></Text>
                    <Text><i>{`Using ${combineWithAnd(workout.equipment.split(',').map(e => e.trim()))}`}</i></Text>
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </Authenticator>
  );
};

export default WorkoutArchivePage;
