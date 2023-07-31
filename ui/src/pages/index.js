import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Authenticator, Card, Heading, Text, Flex, View, Loader, Image } from '@aws-amplify/ui-react';
import { getWorkout } from '../graphql/queries';
import { API } from 'aws-amplify';

const Home = ({ signout, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US'));
  const [workoutDetail, setWorkoutDetail] = useState();

  useEffect(() => {
    if (router.query.date) {
      try {
        const queryDate = new Date(router.query.date.toString());
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
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, []);

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
            <title>Ready, Set, Cloud Fitness!</title>
          </Head>
          {workoutDetail?.workout && (
            <View>
              <Card variation="elevated">
                <Heading level={4}>Warmup</Heading>
                <Flex direction="row" wrap="wrap" gap=".5em" marginTop="1em">
                  {workoutDetail?.workout?.warmup?.exercises?.map(exercise => (
                    <Text basis="48%">{`${exercise.numReps}x ${exercise.name}`}</Text>
                  ))}
                </Flex>
              </Card>
              <Card variation="elevated" marginTop="1em">
                <Heading level={4}>Main Set - {workoutDetail?.workout?.mainSet?.setType.charAt(0).toUpperCase() + workoutDetail?.workout?.mainSet?.setType.slice(1)}</Heading>
                <Flex direction="column" gap=".5em" marginTop="1em">
                  <Heading level={5}>{workoutDetail?.workout?.mainSet?.numSets} rounds</Heading>
                  {workoutDetail?.workout?.mainSet?.sets?.map((set, index) => (
                    <View>
                      <Text><b>Set {index + 1}</b></Text>
                      {set.exercises.map(exercise => (
                        <Text>&ensp;{exercise.name}</Text>
                      ))}
                    </View>
                  ))}
                </Flex>
              </Card>
              <Card variation="elevated" marginTop="1em">
                <Heading level={4}>Abs</Heading>
                <Flex direction="row" wrap="wrap" gap=".5em" marginTop="1em">
                  {workoutDetail?.workout?.abs?.exercises?.map(exercise => (
                    <Text basis="48%">{`${exercise.numReps}x ${exercise.name}`}</Text>
                  ))}
                </Flex>
              </Card>
            </View>
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
