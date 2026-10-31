// Client feedback.
//
// Only people who booked a service can leave feedback: after delivering, give the client a
// one-time code (run `node scripts/new-client-code.mjs "Client Name"`), and add the printed hash
// to `clientCodeHashes`. The /feedback page only opens the form for a valid code.
//
// Submissions are emailed to you via Web3Forms (free). Get an access key at https://web3forms.com
// with your email and paste it below. The key is meant to be public; it only lets the form email you.
// Until it is set, the form falls back to opening a pre-filled email.
export const feedbackConfig = {
  web3formsKey: '',
  clientCodeHashes: [] as string[],
};

// Approved testimonials shown on the site. Copy a submission here once you are happy to publish it
// (the form asks the client for permission to publish).
export const testimonials: {
  name: string;
  role?: string;
  service: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
}[] = [];
