export const translations = {
  hu: {
    // Booking page
    onlineBooking: "Online foglalás",
    bookingDetails: "Foglalás részletei",
    contact: "Kapcsolat",
    openingHours: "Nyitvatartás",

    // Days
    monday: "Hétfő",
    tuesday: "Kedd",
    wednesday: "Szerda",
    thursday: "Csütörtök",
    friday: "Péntek",
    saturday: "Szombat",
    sunday: "Vasárnap",
    closed: "Zárva",

    // Booking form
    selectDate: "Válassz dátumot",
    selectTime: "Válassz időpontot",
    numberOfGuests: "Vendégek száma",
    guests: "fő",
    duration: "Időtartam",
    minutes: "perc",
    table: "Asztal",
    selectTable: "Válassz asztalt",
    automaticAssignment: "Automatikus hozzárendelés",

    // Guest info
    guestInformation: "Vendég adatok",
    firstName: "Keresztnév",
    lastName: "Vezetéknév",
    email: "Email cím",
    phone: "Telefonszám",
    specialRequests: "Különleges kérések",
    specialRequestsPlaceholder: "Allergiák, különleges igények, ünneplés...",
    contactDetails: "Kapcsolattartási adatok",
    required: "*",

    // Form placeholders
    firstNamePlaceholder: "János",
    lastNamePlaceholder: "Kovács",
    phonePlaceholder: "+36301234567",
    emailPlaceholder: "kovacs.janos@example.com",
    specialRequestsOptional: "Különleges kérések (opcionális)",
    specialRequestsFormPlaceholder: "pl. allergia, születésnap, ablak melletti asztal, stb.",

    // Form options
    selectPartySize: "Válassz létszámot",
    partySize: "Létszám",
    date: "Dátum",
    time: "Időpont",
    people: "fő",

    // Form states
    firstSelectDateTime: "Először válassz dátumot és létszámot",
    loadingSlots: "Elérhető időpontok betöltése...",
    noSlotsAvailable: "Nincs elérhető időpont",
    noSlotsForDate: "Ezen a napon nincs elérhető időpont erre a létszámra. Kérlek válassz másik dátumot!",

    // Privacy
    privacyNotice: "A foglalás elküldésével elfogadod az adatkezelési szabályzatunkat",

    // Validation errors
    firstNameRequired: "A keresztnév kötelező",
    lastNameRequired: "A vezetéknév kötelező",
    emailInvalid: "Érvénytelen email cím",
    phoneInvalid: "Érvénytelen telefonszám",
    dateRequired: "Válassz dátumot",
    timeRequired: "Válassz időpontot",
    partySizeRequired: "Add meg a létszámot",

    // Important info
    importantInfo: "Tudnivalók",
    infoConfirmationEmail: "A foglalás megerősítő emailt fogsz kapni",
    infoReminderSMS: "24 órával a foglalás előtt SMS emlékeztetőt küldünk",
    infoArriveOnTime: "Kérjük, pontosan érkezz!",
    infoCancellation: "Lemondás esetén használd az emailben kapott linket",

    // Buttons
    bookNow: "Foglalás leadása",
    booking: "Foglalás...",
    confirmBooking: "Foglalás megerősítése",

    // Messages
    success: "Sikeres foglalás!",
    bookingCreated: "Foglalásod sikeresen létrehoztuk!",
    checkEmail: "Ellenőrizd az email fiókodat a részletekért.",
    error: "Hiba",
    bookingFailed: "Nem sikerült létrehozni a foglalást",
    bookingError: "Hiba történt a foglalás során",
  },

  en: {
    // Booking page
    onlineBooking: "Online Booking",
    bookingDetails: "Booking Details",
    contact: "Contact",
    openingHours: "Opening Hours",

    // Days
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    closed: "Closed",

    // Booking form
    selectDate: "Select Date",
    selectTime: "Select Time",
    numberOfGuests: "Number of Guests",
    guests: "guests",
    duration: "Duration",
    minutes: "min",
    table: "Table",
    selectTable: "Select Table",
    automaticAssignment: "Automatic Assignment",

    // Guest info
    guestInformation: "Guest Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    specialRequests: "Special Requests",
    specialRequestsPlaceholder: "Allergies, special needs, celebration...",
    contactDetails: "Contact Details",
    required: "*",

    // Form placeholders
    firstNamePlaceholder: "John",
    lastNamePlaceholder: "Smith",
    phonePlaceholder: "+1234567890",
    emailPlaceholder: "john.smith@example.com",
    specialRequestsOptional: "Special Requests (Optional)",
    specialRequestsFormPlaceholder: "e.g. allergies, birthday, window table, etc.",

    // Form options
    selectPartySize: "Select party size",
    partySize: "Party Size",
    date: "Date",
    time: "Time",
    people: "people",

    // Form states
    firstSelectDateTime: "First select date and party size",
    loadingSlots: "Loading available times...",
    noSlotsAvailable: "No available times",
    noSlotsForDate: "No available times for this party size on this date. Please choose another date!",

    // Privacy
    privacyNotice: "By submitting this booking you accept our privacy policy",

    // Validation errors
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    emailInvalid: "Invalid email address",
    phoneInvalid: "Invalid phone number",
    dateRequired: "Please select a date",
    timeRequired: "Please select a time",
    partySizeRequired: "Please select party size",

    // Important info
    importantInfo: "Important Information",
    infoConfirmationEmail: "You will receive a booking confirmation email",
    infoReminderSMS: "We'll send you an SMS reminder 24 hours before your booking",
    infoArriveOnTime: "Please arrive on time!",
    infoCancellation: "To cancel, use the link in your confirmation email",

    // Buttons
    bookNow: "Book Now",
    booking: "Booking...",
    confirmBooking: "Confirm Booking",

    // Messages
    success: "Booking Successful!",
    bookingCreated: "Your booking has been created successfully!",
    checkEmail: "Please check your email for details.",
    error: "Error",
    bookingFailed: "Failed to create booking",
    bookingError: "An error occurred during booking",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.hu
