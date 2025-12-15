import React from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  List,
  Divider,
  Anchor,
} from "@mantine/core";

const CommunityGuidelines = () => {
  return (
    <>
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Title order={2}>Community Guidelines</Title>

          <Text c="dimmed">
            Welcome to <strong>MyChat</strong>. These Community Guidelines exist
            to keep the platform safe, respectful, and enjoyable for everyone.
            By using MyChat, you agree to follow the rules below.
          </Text>

          <Divider />

          <Title order={4}>1. Respect Each Other</Title>
          <Text>
            Treat all members with respect. Healthy discussion is welcome, but
            harassment and abuse are not.
          </Text>
          <List withPadding>
            <List.Item>
              Hate speech, slurs, or discrimination of any kind
            </List.Item>
            <List.Item>
              Threats, intimidation, or encouragement of violence
            </List.Item>
            <List.Item>Bullying, harassment, or targeted attacks</List.Item>
          </List>

          <Divider />

          <Title order={4}>2. No Illegal or Harmful Activity</Title>
          <Text>
            MyChat must not be used to promote or engage in illegal or dangerous
            behavior.
          </Text>
          <List withPadding>
            <List.Item>Terrorism, extremism, or organized violence</List.Item>
            <List.Item>
              Buying, selling, or distributing illegal drugs, weapons, or stolen
              goods
            </List.Item>
            <List.Item>
              Instructions for committing crimes or avoiding law enforcement
            </List.Item>
          </List>

          <Divider />

          <Title order={4}>3. Keep Content Appropriate</Title>
          <Text>Help keep MyChat welcoming for a wide audience.</Text>
          <List withPadding>
            <List.Item>Explicit sexual content or pornography</List.Item>
            <List.Item>
              Sexual content involving minors (zero tolerance)
            </List.Item>
            <List.Item>Graphic violence or extreme gore</List.Item>
          </List>

          <Divider />

          <Title order={4}>4. Privacy & Safety</Title>
          <Text>
            Respect your privacy and the privacy of others at all times.
          </Text>
          <List withPadding>
            <List.Item>
              Sharing personal or private information without consent (doxxing)
            </List.Item>
            <List.Item>
              Impersonating other users, moderators, or MyChat staff
            </List.Item>
            <List.Item>Scams, phishing, or misleading links</List.Item>
          </List>

          <Divider />

          <Title order={4}>5. Spam & Platform Abuse</Title>
          <Text>
            Use MyChat as intended and do not disrupt the experience for others.
          </Text>
          <List withPadding>
            <List.Item>Spamming messages, emojis, or links</List.Item>
            <List.Item>
              Advertising or self-promotion without permission
            </List.Item>
            <List.Item>
              Using bots, exploits, or automation to abuse the platform
            </List.Item>
          </List>

          <Divider />

          <Title order={4}>6. Server & Channel Rules</Title>
          <Text>
            Individual servers and channels may have additional rules.
          </Text>
          <List withPadding>
            <List.Item>Follow server-specific guidelines</List.Item>
            <List.Item>
              Moderators may remove content to keep discussions on topic
            </List.Item>
          </List>

          <Divider />

          <Title order={4}>7. Enforcement</Title>
          <Text>
            Violations of these guidelines may result in action, including:
          </Text>
          <List withPadding>
            <List.Item>Content removal</List.Item>
            <List.Item>Temporary restrictions or timeouts</List.Item>
            <List.Item>Permanent account or server bans</List.Item>
          </List>

          <Text c="dimmed" fz="sm">
            Enforcement decisions are based on severity, intent, and previous
            behavior.
          </Text>

          <Divider />

          <Title order={4}>8. Reporting Issues</Title>
          <Text>If you encounter content that violates these guidelines:</Text>
          <List withPadding>
            <List.Item>Use the in-app report tools</List.Item>
            <List.Item>Contact a server moderator or administrator</List.Item>
          </List>

          <Text c="dimmed" fz="sm">
            Do not engage with rule-breakers directly.
          </Text>

          <Divider />

          <Text c="dimmed" fz="sm">
            These guidelines may be updated from time to time. Continued use of
            MyChat means you agree to the latest version.
          </Text>

          <Text ta="center" fw={500}>
            Be kind. Be responsible. Help build a great community.
          </Text>

          <Text ta="center" fz="sm" c="dimmed">
            © {new Date().getFullYear()} MyChat
          </Text>
        </Stack>
      </Container>
    </>
  );
};

export default CommunityGuidelines;
