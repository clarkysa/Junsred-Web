import { Box, Flex } from '@chakra-ui/react';
import {
  BsDiscord,
  BsFolder,
  BsGithub,
  BsHammer,
  BsHouse,
  BsTwitch,
  BsTwitter,
  BsYoutube,
} from 'react-icons/bs';

import PageButton from '@/components/buttons/page-button';
import SocialButton from '@/components/buttons/social-button';

import styles from './navbar.module.css';

export function Navbar() {
  return (
    <Box className={styles['navbar']} backgroundColor={'purple.900'}>
      <Box>
        <PageButton Icon={BsHouse} link={'/'}>
          Me
        </PageButton>
        <PageButton Icon={BsFolder} link={'/projects'}>
          Projects
        </PageButton>
        <PageButton Icon={BsHammer} link={'/hireme'}>
          Hire Me
        </PageButton>
      </Box>
      <Flex className={styles['social']}>
        <SocialButton
          Icon={BsDiscord}
          link="https://discord.gg/"
          scheme="teal"
        />
        <SocialButton
          Icon={BsGithub}
          link="https://github.com/eljunsred"
          scheme="gray"
        />
        {/* <SocialButton Icon={BsLinkedin} link="https://twitter.com/sammwy" scheme="linkedin" /> */}
        <SocialButton
          Icon={BsTwitch}
          link="https://twitch.tv/junsosu"
          scheme="purple"
        />
        <SocialButton
          Icon={BsTwitter}
          link="https://twitter.com/"
          scheme="twitter"
        />
        <SocialButton
          Icon={BsYoutube}
          link="https://youtube.com/c/DracoGhoul"
          scheme="red"
        />
      </Flex>
    </Box>
  );
}
