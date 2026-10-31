// Generates a one-time feedback code for a client who booked a service.
// Usage: node scripts/new-client-code.mjs "Client Name"
// Give the CODE to the client; add the HASH to clientCodeHashes in src/data/feedback.ts.
import { createHash, randomBytes } from 'node:crypto';

const name = process.argv.slice(2).join(' ') || 'client';
const code = `NS-${randomBytes(3).toString('hex').toUpperCase()}`;
const hash = createHash('sha256').update(code).digest('hex');

console.log(`Client: ${name}`);
console.log(`Code (send to client): ${code}`);
console.log(`Hash (add to feedback.ts): '${hash}', // ${name}`);
console.log(`Feedback link: https://nayeem-shaik.vercel.app/feedback?code=${code}`);
