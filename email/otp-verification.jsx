import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

export const OTPVerificationEmail = ({ otp }) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <img src="https://crexsim.vercel.app/Logo.jpeg" width="64" height="64" alt="Crexsim" style={logoImage} />
          </Section>
          <Heading style={heading}>Verify your email address</Heading>
          <Text style={paragraph}>
            Please use the following OTP code to verify your email address. This code will expire in 10 minutes.
          </Text>
          <Section style={otpSection}>
            <Text style={otpCode}>{otp}</Text>
          </Section>
          <Text style={paragraph}>If you didn't request this code, you can safely ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#09090B",
  color: "#FFFFFF",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
}

const logo = {
  marginBottom: "24px",
}

const logoImage = {
  borderRadius: "50%",
}

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  color: "#FFFFFF",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#A1A1AA",
}

const otpSection = {
  padding: "24px",
  backgroundColor: "#18181B",
  borderRadius: "12px",
  margin: "24px 0",
}

const otpCode = {
  fontSize: "32px",
  fontWeight: "700",
  textAlign: "center",
  letterSpacing: "0.5em",
  color: "#FFFFFF",
  margin: "0",
}

export default OTPVerificationEmail

