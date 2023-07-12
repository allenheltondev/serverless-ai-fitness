import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { Flex, Link, Text, Image, Button } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth/lib/types';
import { config } from '@/config';
Amplify.configure(config);


const TitleBar = ({ title }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileView = window.matchMedia('(max-width: 600px)').matches;
      setIsMobile(mobileView);
    }

    window.addEventListener('resize', checkMobile);
    checkMobile();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        console.log(user);
        setIsSignedIn(true);
      } catch {
        setIsSignedIn(false);
      }
    }
    checkUser();
  }, []);

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center" padding="1rem">
        <Link href="https://readysetcloud.io"><Image maxHeight="1.5em" height="auto" maxWidth="100%" src="https://www.readysetcloud.io/images/logo.png" alt="Ready, Set, Cloud logo" /></Link>
        {!isMobile && <Text fontSize="1.3rem">{title}</Text>}
        {isSignedIn ? <Button>Avatar</Button> : <Button variation="menu" onClick={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}>Sign In</Button>}
      </Flex>
      <hr color="lightgray" />
    </>
  );
};

export default TitleBar;
