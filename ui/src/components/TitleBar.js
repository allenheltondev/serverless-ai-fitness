import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { Flex, Link, Text, Image, Button, Menu, MenuItem } from '@aws-amplify/ui-react';
import { GiWeightLiftingUp, GiWeight } from 'react-icons/gi';
import { CgProfile, CgCalendar } from 'react-icons/cg';
import { BiHelpCircle, BiMenu } from 'react-icons/bi';
import { useRouter } from 'next/router';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth/lib/types';
import { config } from '../config';
import { isMobile } from 'react-device-detect';
Amplify.configure(config);


const TitleBar = ({ toggleMenu }) => {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
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
        <Flex direction="row" gap="1em" alignItems="center" justifyContent="center">
          {(isMobile && isSignedIn) && (
            <Menu menuAlign="start">
              <MenuItem onClick={(() => router.push('/'))}>
                <GiWeightLiftingUp color="black" />
                <Text marginLeft=".6em">Workout</Text>
              </MenuItem>
              <MenuItem onClick={(() => router.push('/calendar'))}>
                <CgCalendar color="black" />
                <Text marginLeft=".6em">Calendar</Text>
              </MenuItem>
              <MenuItem onClick={(() => router.push('/settings'))}>
                <GiWeight color="black" />
                <Text marginLeft=".6em">Settings</Text>
              </MenuItem>
              <MenuItem onClick={() => router.push('/profile')}>
                <CgProfile color="black" />
                <Text marginLeft=".6em">Profile</Text>
              </MenuItem>
              <MenuItem onClick={() => router.push('/help')}>
                <BiHelpCircle color="black" />
                <Text marginLeft=".6em">Help</Text>
              </MenuItem>
            </Menu>
          )}
          {(!isMobile && isSignedIn) && (
            <Button variation="menu" onClick={() => toggleMenu()}><BiMenu size="1.5em" /></Button>
          )}
          <Link href="https://readysetcloud.io"><Image marginTop={".5em"} maxHeight="1.5em" height="auto" maxWidth="100%" src="https://www.readysetcloud.io/images/logo.png" alt="Ready, Set, Cloud logo" /></Link>
        </Flex>
        {isSignedIn ? <Button variation="link" onClick={(() => Auth.signOut())} padding={isMobile ? "0em" : ""}>Sign Out</Button> : <Button variation="menu" padding={isMobile ? "0em" : ""} onClick={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}>Sign In</Button>}
      </Flex>
      <hr color="lightgray" />
    </>
  );
};

export default TitleBar;
