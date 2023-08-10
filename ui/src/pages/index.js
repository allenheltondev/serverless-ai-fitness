import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Authenticator, Heading, Text, Flex, Loader, Image, Alert, Link } from '@aws-amplify/ui-react';
import { getWorkout, isConfigured } from '../graphql/queries';
import { API } from 'aws-amplify';
import Workout from '../components/Workout';

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
            <Workout detail={workoutDetail} showDate={true} />
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
