// --- Imports ---
// Use node-fetch for making HTTP requests in a Node.js environment.
import fetch from 'node-fetch';
// Use firebase-admin for secure, server-side access to your Firestore database.
import admin from 'firebase-admin';

// --- Firebase Admin Initialization ---
// The service account key is stored as a JSON string in a Netlify environment variable.
// We parse it here to authenticate the function with Firebase.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the Firebase Admin SDK if it hasn't been already.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// --- Main Handler ---
// This is the main function that Netlify will run on the schedule (e.g., every minute).
export const handler = async (event, context) => {
  console.log('Data Fetcher function triggered...');

  try {
    // Get the global configuration document from Firestore.
    const configDocRef = db.collection('config').doc('global');
    const configDoc = await configDocRef.get();
    if (!configDoc.exists) {
      throw new Error("Global config document not found in Firestore.");
    }
    const configData = configDoc.data();
    const { fetcher, selectedFixtureId, lastProcessedTriggers = {} } = configData;

    // The base URL of your Netlify site, used to call your own API proxy.
    const siteUrl = process.env.URL || 'http://localhost:8888';

    // --- Process Manual Triggers ---
    // Check if any manual refresh buttons have been pressed in the control app.
    if (fetcher.manualFetchTriggers) {
      // Check for live data trigger (e.g., "Fetch Live Data Now" button)
      if (fetcher.manualFetchTriggers.liveData?.toMillis() !== lastProcessedTriggers.liveData) {
        console.log('Manual trigger for live data detected.');
        await fetchAndStoreLiveData(siteUrl, selectedFixtureId);
        lastProcessedTriggers.liveData = fetcher.manualFetchTriggers.liveData.toMillis();
      }
      // Add more manual trigger checks here (e.g., for fixtures, predictions) as needed.
    }

    // --- Process Automatic Live Polling ---
    // If live polling is enabled in the control app, check if it's time to poll.
    if (fetcher.enableLivePolling && selectedFixtureId) {
      const liveDataDocRef = db.collection('liveData').doc(String(selectedFixtureId));
      const liveDataDoc = await liveDataDocRef.get();
      const lastUpdate = liveDataDoc.data()?.lastUpdated?.toMillis() || 0;
      const now = Date.now();
      const interval = (fetcher.livePollingIntervalSeconds || 30) * 1000;

      if (now - lastUpdate > interval) {
        console.log(`Polling live data: ${Math.round((now - lastUpdate) / 1000)}s since last update.`);
        await fetchAndStoreLiveData(siteUrl, selectedFixtureId);
      } else {
        console.log('Skipping live poll: Not enough time has passed.');
      }
    }

    // --- Update Processed Triggers Timestamps ---
    // Save the timestamps of the manual triggers we've just processed.
    await configDocRef.update({ lastProcessedTriggers });

    console.log('Data Fetcher function completed successfully.');
    return { statusCode: 200, body: 'Fetch process completed.' };

  } catch (error) {
    console.error('Error in Data Fetcher function:', error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};

// --- Data Fetching and Storing Logic ---
/**
 * Fetches all live data for a specific fixture and updates Firestore.
 * This includes stats, events, lineups, and league-wide live fixtures.
 * @param {string} siteUrl - The base URL of the Netlify site.
 * @param {number} fixtureId - The ID of the fixture to fetch data for.
 */
async function fetchAndStoreLiveData(siteUrl, fixtureId) {
  if (!fixtureId) {
    console.log('Skipping live data fetch: No fixture ID selected.');
    return;
  }

  // Define all the API endpoints we need to call.
  const endpoints = {
    fixtureDetails: `/api/fixtures?id=${fixtureId}`,
    lineups: `/api/fixtures/lineups?fixture=${fixtureId}`,
    matchStats: `/api/fixtures/statistics?fixture=${fixtureId}`,
    playerStats: `/api/fixtures/players?fixture=${fixtureId}`,
    matchEvents: `/api/fixtures/events?fixture=${fixtureId}`,
    liveFixtures: `/api/fixtures?live=all`, // For the scroller
    standings: null // Will be determined from fixtureDetails
  };

  // Fetch all endpoints in parallel for efficiency.
  const [
    fixtureDetailsRes,
    lineupsRes,
    matchStatsRes,
    playerStatsRes,
    matchEventsRes,
    liveFixturesRes
  ] = await Promise.all(Object.values(endpoints).filter(e => e).map(endpoint => fetch(siteUrl + endpoint)));

  // Parse all responses.
  const fixtureDetailsData = await fixtureDetailsRes.json();
  const lineupData = await lineupsRes.json();
  const matchStatsData = await matchStatsRes.json();
  const playerStatsData = await playerStatsRes.json();
  const matchEventsData = await matchEventsRes.json();
  const liveFixturesData = await liveFixturesRes.json();

  // --- Process and Structure Data ---
  const fixtureDetails = fixtureDetailsData.response?.[0];
  if (!fixtureDetails) {
    console.warn('Could not fetch main fixture details. Aborting live data update.');
    return;
  }

  // Extract home and away data for easier access
  const homeTeamId = fixtureDetails.teams.home.id;
  const awayTeamId = fixtureDetails.teams.away.id;

  const structuredData = {
    fixtureDetails: fixtureDetails,
    lineupData: {
      home: lineupData.response?.find(t => t.team.id === homeTeamId),
      away: lineupData.response?.find(t => t.team.id === awayTeamId)
    },
    matchStatsData: {
      home: matchStatsData.response?.find(t => t.team.id === homeTeamId),
      away: matchStatsData.response?.find(t => t.team.id === awayTeamId)
    },
    playerStatsData: {
      home: playerStatsData.response?.find(t => t.team.id === homeTeamId),
      away: playerStatsData.response?.find(t => t.team.id === awayTeamId)
    },
    matchEventsData: matchEventsData.response || [],
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  };

  // --- Write to Firestore ---
  // Write all fixture-specific data to the liveData document.
  const liveDataDocRef = db.collection('liveData').doc(String(fixtureId));
  await liveDataDocRef.set(structuredData, { merge: true });
  console.log(`Updated liveData/${fixtureId} in Firestore.`);

  // Process and write league-wide data (for scroller, combined events ticker).
  const leagueId = fixtureDetails.league.id;
  const season = fixtureDetails.league.season;
  const liveFixtures = liveFixturesData.response || [];
  const leagueEvents = liveFixtures
    .filter(f => f.events)
    .flatMap(f => f.events.map(e => ({ ...e, fixtureInfo: { fixtureId: f.fixture.id, homeTeam: f.teams.home.name, awayTeam: f.teams.away.name, score: `${f.goals.home}-${f.goals.away}` }})));

  const leagueDataDocRef = db.collection('leagueData').doc(`${leagueId}_${season}`);
  await leagueDataDocRef.set({
    liveFixtures: liveFixtures,
    leagueEvents: leagueEvents,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  console.log(`Updated leagueData/${leagueId}_${season} in Firestore.`);
}
