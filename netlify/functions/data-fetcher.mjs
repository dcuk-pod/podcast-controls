// --- Imports ---
import fetch from 'node-fetch';
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
    let processedTriggers = { ...lastProcessedTriggers };

    // --- Process Manual Triggers ---
    if (fetcher.manualFetchTriggers) {
      const now = Date.now();
      
      // Check for fixtures trigger
      if (fetcher.manualFetchTriggers.fixtures?.toMillis() > (lastProcessedTriggers.fixtures || 0)) {
        console.log('Manual trigger for fixtures detected.');
        await fetchAndStoreFixtures(siteUrl, fetcher.targetYear_Fixtures || new Date().getFullYear());
        processedTriggers.fixtures = now;
      }
      
      // Check for live data trigger
      if (fetcher.manualFetchTriggers.liveData?.toMillis() > (lastProcessedTriggers.liveData || 0)) {
        console.log('Manual trigger for live data detected.');
        await fetchAndStoreLiveData(siteUrl, selectedFixtureId);
        processedTriggers.liveData = now;
      }
      
      // Check for player season data trigger
      if (fetcher.manualFetchTriggers.playerSeasonData?.toMillis() > (lastProcessedTriggers.playerSeasonData || 0)) {
        console.log('Manual trigger for player season data detected.');
        await fetchAndStorePlayerSeasonData(siteUrl, fetcher.targetPlayerId_Season, new Date().getFullYear());
        processedTriggers.playerSeasonData = now;
      }
      
      // Check for prediction data trigger
      if (fetcher.manualFetchTriggers.predictionData?.toMillis() > (lastProcessedTriggers.predictionData || 0)) {
          console.log('Manual trigger for prediction data detected.');
          await fetchAndStorePredictionData(siteUrl, selectedFixtureId);
          processedTriggers.predictionData = now;
      }
    }

    // --- Process Automatic Live Polling ---
    if (fetcher.enableLivePolling && selectedFixtureId) {
      const liveDataDocRef = db.collection('liveData').doc(String(selectedFixtureId));
      const liveDataDoc = await liveDataDocRef.get();
      const lastUpdate = liveDataDoc.data()?.lastUpdated?.toMillis() || 0;
      const now = Date.now();
      const interval = (fetcher.livePollingIntervalSeconds || 30) * 1000;

      if (now - lastUpdate > interval) {
        console.log(`Polling live data: ${Math.round((now - lastUpdate) / 1000)}s since last update.`);
        await fetchAndStoreLiveData(siteUrl, selectedFixtureId);
      }
    }
    
    // --- Update API Status Periodically ---
    const lastApiStatusCheck = configData.apiStatus?.lastChecked?.toMillis() || 0;
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - lastApiStatusCheck > oneHour) {
      console.log('Fetching API status...');
      await fetchAndStoreApiStatus(siteUrl);
    }

    // --- Update Processed Triggers Timestamps ---
    await configDocRef.update({ lastProcessedTriggers: processedTriggers });

    console.log('Data Fetcher function completed successfully.');
    return { statusCode: 200, body: 'Fetch process completed.' };

  } catch (error) {
    console.error('Error in Data Fetcher function:', error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};

const DC_UNITED_TEAM_ID = 1615;

async function apiFetch(siteUrl, path) {
    const response = await fetch(`${siteUrl}/api${path}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed for ${path}: ${response.status} ${errorText}`);
    }
    return response.json();
}

async function fetchAndStoreFixtures(siteUrl, year) {
    if (!year) {
        console.log('Skipping fixture fetch: No year specified.');
        return;
    }
    console.log(`Fetching fixtures for year ${year}...`);
    const data = await apiFetch(siteUrl, `/fixtures?season=${year}&team=${DC_UNITED_TEAM_ID}`);
    const fixturesDocRef = db.collection('fixtures').doc(`${DC_UNITED_TEAM_ID}_${year}`);
    await fixturesDocRef.set({ fixtures: data.response }, { merge: true });
    console.log(`Stored fixtures for ${year} in Firestore.`);
}

async function fetchAndStoreLiveData(siteUrl, fixtureId) {
  if (!fixtureId) {
    console.log('Skipping live data fetch: No fixture ID selected.');
    return;
  }

  const fixtureDetailsData = await apiFetch(siteUrl, `/fixtures?id=${fixtureId}`);
  const fixtureDetails = fixtureDetailsData.response?.[0];
  if (!fixtureDetails) {
    console.warn(`Could not fetch main fixture details for fixture ID ${fixtureId}. Aborting live data update.`);
    return;
  }
  
  const { league, teams } = fixtureDetails;
  
  const endpoints = {
    lineups: `/fixtures/lineups?fixture=${fixtureId}`,
    matchStats: `/fixtures/statistics?fixture=${fixtureId}`,
    playerStats: `/fixtures/players?fixture=${fixtureId}`,
    matchEvents: `/fixtures/events?fixture=${fixtureId}`,
    liveFixtures: `/fixtures?live=all&league=${league.id}`,
  };

  const results = await Promise.all(
      Object.entries(endpoints).map(([key, path]) => 
          apiFetch(siteUrl, path).then(data => ({key, data})).catch(e => ({key, error: e}))
      )
  );
  
  const dataMap = results.reduce((acc, result) => {
      if (result.error) console.error(`Error fetching ${result.key}:`, result.error);
      acc[result.key] = result.data?.response;
      return acc;
  }, {});

  const homeTeamId = teams.home.id;
  const awayTeamId = teams.away.id;

  const structuredData = {
    fixtureDetails: fixtureDetails,
    lineupData: {
      home: dataMap.lineups?.find(t => t.team.id === homeTeamId),
      away: dataMap.lineups?.find(t => t.team.id === awayTeamId)
    },
    matchStatsData: {
      home: dataMap.matchStats?.find(t => t.team.id === homeTeamId),
      away: dataMap.matchStats?.find(t => t.team.id === awayTeamId)
    },
    playerStatsData: {
      home: dataMap.playerStats?.find(t => t.team.id === homeTeamId),
      away: dataMap.playerStats?.find(t => t.team.id === awayTeamId)
    },
    matchEventsData: dataMap.matchEvents || [],
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  };

  const liveDataDocRef = db.collection('liveData').doc(String(fixtureId));
  await liveDataDocRef.set(structuredData, { merge: true });
  console.log(`Updated liveData/${fixtureId} in Firestore.`);

  const leagueEvents = (dataMap.liveFixtures || [])
    .filter(f => f.events)
    .flatMap(f => f.events.map(e => ({ ...e, fixtureInfo: { fixtureId: f.fixture.id, homeTeam: f.teams.home.name, awayTeam: f.teams.away.name, score: `${f.goals.home}-${f.goals.away}` }})));

  const leagueDataDocRef = db.collection('leagueData').doc(`${league.id}_${league.season}`);
  await leagueDataDocRef.set({
    liveFixtures: dataMap.liveFixtures || [],
    leagueEvents: leagueEvents,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  console.log(`Updated leagueData/${league.id}_${league.season} in Firestore.`);
}

async function fetchAndStorePlayerSeasonData(siteUrl, playerId, season) {
    if (!playerId || !season) {
        console.log('Skipping player season fetch: Missing player ID or season.');
        return;
    }
    console.log(`Fetching season data for player ${playerId}, season ${season}...`);
    const data = await apiFetch(siteUrl, `/players?id=${playerId}&season=${season}`);
    const playerData = data.response?.[0];
    if (playerData) {
        const docRef = db.collection('players').doc(String(playerId));
        await docRef.set({ seasonStats: { [season]: playerData } }, { merge: true });
        // Also write it to the liveData doc for immediate use by the visual
        const configDoc = await db.collection('config').doc('global').get();
        const selectedFixtureId = configDoc.data()?.selectedFixtureId;
        if (selectedFixtureId) {
            const liveDataDocRef = db.collection('liveData').doc(String(selectedFixtureId));
            await liveDataDocRef.set({ playerSeasonData: { [playerId]: playerData } }, { merge: true });
        }
        console.log(`Stored season data for player ${playerId} in Firestore.`);
    } else {
        console.warn(`No season data found for player ${playerId}`);
    }
}

async function fetchAndStorePredictionData(siteUrl, fixtureId) {
    if (!fixtureId) {
        console.log('Skipping prediction fetch: No fixture ID selected.');
        return;
    }
    console.log(`Fetching prediction data for fixture ${fixtureId}...`);
    const data = await apiFetch(siteUrl, `/predictions?fixture=${fixtureId}`);
    const predictionData = data.response?.[0];
    if (predictionData) {
        const liveDataDocRef = db.collection('liveData').doc(String(fixtureId));
        await liveDataDocRef.set({ predictionData: predictionData }, { merge: true });
        console.log(`Stored prediction data for fixture ${fixtureId} in Firestore.`);
    } else {
        console.warn(`No prediction data found for fixture ${fixtureId}`);
    }
}

async function fetchAndStoreApiStatus(siteUrl) {
    try {
        const data = await apiFetch(siteUrl, '/status');
        if (data.response && data.response.requests) {
            const status = {
                current: data.response.requests.current,
                limit_day: data.response.requests.limit_day,
                lastChecked: admin.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('config').doc('global').update({ apiStatus: status });
            console.log('API status updated in Firestore.');
        }
    } catch (e) {
        console.error('Could not update API status:', e.message);
    }
}

