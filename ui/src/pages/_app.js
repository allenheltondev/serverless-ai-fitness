import '../styles/globals.css';
import '@aws-amplify/ui-react/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { Amplify } from 'aws-amplify';
import { useState } from 'react';
import { AmplifyProvider, Card, Flex, Text } from '@aws-amplify/ui-react';
import { config } from '../config';
import TitleBar from '../components/TitleBar';
import { ToastContainer } from 'react-toastify';
import { isMobile } from 'react-device-detect'
import SideMenu from '../components/SideMenu';

Amplify.configure(config);

export default function App({ Component, pageProps }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isClientMobile, setIsClientMobile] = useState(isMobile);
  const currentYear = new Date().getFullYear();

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <AmplifyProvider>
      <Flex id="page" direction="column" height="100%">
        <Card padding="0">
          <TitleBar toggleMenu={toggleMenu} />
        </Card>
        <Flex id="navAndContent" direction="row" padding="0em 1em 1em 1em" justifyContent="space-between" minHeight="93vh">
          {!isClientMobile && <SideMenu isOpen={isMenuOpen} />}
          <Flex id="content" direction="column" style={{ flexBasis: "100%" }} justifyContent="space-between">
            <Card variation="elevated" height="relative.full" padding={isMobile ? "1em" : "2em 2em"}>
              <Component {...pageProps} />
            </Card>
            <Card variation="elevated" backgroundColor={"var(--primary)"}>
              <Flex alignContent="center" justifyContent="center" height="100%">
                <Text color="white" fontSize={isClientMobile ? ".9rem": "1rem"}>
                  | &copy; {currentYear} <i>Ready, Set, Cloud!</i> | All rights reserved! |
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Flex>
      <ToastContainer />
    </AmplifyProvider>
  )
};
