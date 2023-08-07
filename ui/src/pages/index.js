import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Authenticator, Card, Heading, Text, Flex, View, Loader, Image, Alert, Link } from '@aws-amplify/ui-react';
import { getWorkout, isConfigured } from '../graphql/queries';
import { API } from 'aws-amplify';
import equipment from '../../lib/Equipment';
import workoutTypes from '../../lib/WorkoutTypes';

const Home = ({ signout, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUserConfigured, setIsUserConfigured] = useState(false);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US'));
  const [workoutDetail, setWorkoutDetail] = useState();

  useEffect(() => {
    if (router.query.date) {
      try {
        const queryDate = new Date(`${router.query.date}T23:59:59`);
        setDate(queryDate.toLocaleDateString('en-US'));
      }
      catch (err) {
      }
    }
  }, [router.query]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      setLoading(true);
      try {
        const workoutSettings = await API.graphql({
          query: getWorkout,
          variables: {
            date: new Date(date).toISOString().split('T')[0]
          }
        });

        setWorkoutDetail(workoutSettings.data.getUserWorkout);
        const configuration = await API.graphql({ query: isConfigured });
        setIsUserConfigured(configuration.data.isUserConfigured);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [date]);

  const getWorkoutHeading = () => {
    const header = `${workoutDetail.muscleGroup} ${workoutTypes.find(wt => wt.value == workoutDetail.workoutType)?.name} Workout - ${new Date(workoutDetail.date + 'T23:59:59').toLocaleDateString()}`
    return toTitleCase(header);
  };

  const getWorkoutEquipment = () => {
    const allEquipment = workoutDetail.equipment.split(',');
    const formattedEquipment = allEquipment.map(e => {
      return equipment.find(equip => equip.value == e.trim())?.name
    });

    return combineWithAnd(formattedEquipment);
  };

  const toTitleCase = (unformatted) => {
    return unformatted.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const combineWithAnd = (strings) => {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    if (strings.length === 2) return strings.join(' and ');
  
    const allButLast = strings.slice(0, -1).join(', ');
    const last = strings[strings.length - 1];
  
    return `${allButLast}, and ${last}`;
  };

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" justifyContent="center" >
        <Loader size="large" />
      </Flex>
    );
  }

  return (
    <Authenticator socialProviders={["google"]}>
      {({ signOut, user }) => (
        <Flex direction="column" width="100%">
          <Head>
            <title>Workout | Ready, Set, Cloud Fitness!</title>
          </Head>
          {!isUserConfigured && (
            <Alert variation="warning" hasIcon={true} isDismissible={false} heading="Update needed">
              Looks like you still need some configuration. Head over to <Link href="/settings">settings</Link> to finish setting up!
            </Alert>
          )}
          {workoutDetail?.workout && (
            <>
              <Alert backgroundColor={"var(--primary)"} hasIcon={false} isDismissible={false}>
                <Heading level={5} color="white">{getWorkoutHeading()}</Heading>
                <Text marginTop=".3em" color="white"><i>With {getWorkoutEquipment()}</i></Text>
              </Alert>
              <View>
                <Card variation="elevated">
                  <Heading level={4}>Warmup</Heading>
                  <Flex direction="row" wrap="wrap" gap=".5em" marginTop="1em">
                    {workoutDetail?.workout?.warmup?.exercises?.map((exercise, exerciseIndex) => (
                      <Text key={`workout-${exerciseIndex}`} basis="48%">{`${exercise.numReps}x ${exercise.name}`}</Text>
                    ))}
                  </Flex>
                </Card>
                <Card variation="elevated" marginTop="1em">
                  <Heading level={4}>Main Set</Heading>
                  <Flex direction="column" gap=".5em" marginTop="1em">
                    <Heading level={5}>{workoutDetail?.workout?.mainSet?.numSets} rounds</Heading>
                    {workoutDetail?.workout?.mainSet?.sets?.map((set, index) => (
                      <View key={`set-${index}`}>
                        <Text><b>Set {index + 1}</b></Text>
                        {set.exercises.map((exercise, exerciseIndex) => (
                          <Text key={`set-${index}-${exerciseIndex}`}>&ensp;{exercise.name}</Text>
                        ))}
                      </View>
                    ))}
                  </Flex>
                </Card>
                <Card variation="elevated" marginTop="1em">
                  <Heading level={4}>Abs</Heading>
                  <Flex direction="row" wrap="wrap" gap=".5em" marginTop="1em">
                    {workoutDetail?.workout?.abs?.exercises?.map((exercise, exerciseIndex) => (
                      <Text key={`ab-${exerciseIndex}`} basis="48%">{`${exercise.numReps}x ${exercise.name}`}</Text>
                    ))}
                  </Flex>
                </Card>
              </View>
            </>
          )}
          {!workoutDetail?.workout && (
            <Flex direction="column" alignItems="center">
              <Heading level={5}>No Workout Today</Heading>
              <Text>You can take it easy, maybe go do some stretching.</Text>
              <Image src="https://readysetcloud.s3.amazonaws.com/day-off.jpg" width="50%" />
            </Flex>
          )}
        </Flex>
      )}
    </Authenticator>
  );
};

export default Home;
