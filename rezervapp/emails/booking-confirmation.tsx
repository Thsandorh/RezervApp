import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components"

interface BookingConfirmationEmailProps {
  guestName: string
  restaurantName: string
  bookingDate: string
  bookingTime: string
  partySize: number
  tableName?: string
  specialRequests?: string
  cancelUrl: string
}

export default function BookingConfirmationEmail({
  guestName,
  restaurantName,
  bookingDate,
  bookingTime,
  partySize,
  tableName,
  specialRequests,
  cancelUrl,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Foglalásod megerősítve - {restaurantName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Foglalás megerősítve! ✅</Heading>

          <Text style={text}>Kedves {guestName}!</Text>

          <Text style={text}>
            Örömmel értesítünk, hogy foglalásodat sikeresen rögzítettük a következő adatokkal:
          </Text>

          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong>Étterem:</strong> {restaurantName}
            </Text>
            <Text style={detailRow}>
              <strong>Dátum:</strong> {bookingDate}
            </Text>
            <Text style={detailRow}>
              <strong>Időpont:</strong> {bookingTime}
            </Text>
            <Text style={detailRow}>
              <strong>Létszám:</strong> {partySize} fő
            </Text>
            {tableName && (
              <Text style={detailRow}>
                <strong>Asztal:</strong> {tableName}
              </Text>
            )}
            {specialRequests && (
              <Text style={detailRow}>
                <strong>Kérések:</strong> {specialRequests}
              </Text>
            )}
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            Tudnivalók
          </Heading>

          <Text style={text}>
            • 24 órával a foglalás előtt SMS emlékeztetőt fogsz kapni
            <br />
            • Kérjük, pontosan érkezz!
            <br />
            • Ha mégsem tudsz eljönni, kérjük, lemondod a foglalást
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={cancelUrl}>
              Foglalás lemondása
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Üdvözlettel,
            <br />
            {restaurantName} csapata
            <br />
            <br />
            <em style={footerText}>
              Ez egy automatikus email. Kérjük, ne válaszolj rá!
            </em>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 48px",
}

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px",
  padding: "0 48px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 48px",
}

const detailsBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "24px",
}

const detailRow = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const buttonContainer = {
  padding: "0 48px",
  marginTop: "24px",
}

const button = {
  backgroundColor: "#ef4444",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
}

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 48px",
}

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
}
