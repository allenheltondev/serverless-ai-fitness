import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Workout from '../../lib/Workout';
import TitleBar from '../components/TitleBar';
import { Authenticator } from '@aws-amplify/ui-react';

const Home = ({ signout, user }: any) => {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout>();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US'));
  const [title, setTitle] = useState('');

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
    const fetchWorkout = async () => {
      let workoutData = localStorage.getItem(date);
      if (workoutData) {
        const cachedData = JSON.parse(workoutData);
        setWorkout(new Workout(cachedData));
        setTitle(`${cachedData.muscleGroup.charAt(0).toUpperCase() + cachedData.muscleGroup.slice(1)} Workout for ${date}`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.readysetcloud.io/fitness/workouts?date=${date}`);
        switch (response.status) {
          case 500:
            console.error('Something went wrong loading the page', response.body);
            break;
          default:
            const data = new Workout(await response.json());
            setWorkout(data);
            setTitle(`${data.muscleGroup.charAt(0).toUpperCase() + data.muscleGroup.slice(1)} Workout for ${date}`);
            localStorage.setItem(date, JSON.stringify(data));
            break;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout:', error);
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [date]);

  if (loading) {
    return (
      <div>
        <TitleBar title={''} />
        <div className={styles.loadingContainer}>
          <div className={styles.row}>
            <span className={styles.loading}>Loading</span>
            <div className={styles.loadingDots}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return <div>Error loading workout.</div>;
  }

  return (
    <Authenticator socialProviders={["google"]}>
      {({ signOut, user }) => (
        <div className={styles.page}>
          <Head>
            <title>Ready, Set, Cloud Fitness!</title>
          </Head>
          <h2 className={styles.mobileHeader}>{title}</h2>
          <div className={styles.container}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Warmup</h2>
              <p className={styles.sectionContent}>{workout.warmup}</p>
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Main Set</h2>
              <p className={styles.sectionContent}>{workout.mainSet}</p>
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Cooldown</h2>
              <p className={styles.sectionContent}>{workout.cooldown}</p>
            </div>
          </div>
        </div>
      )}
    </Authenticator>
  );
};

export default Home;
