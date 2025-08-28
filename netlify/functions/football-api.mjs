import fetch from 'node-fetch';

export const handler = async (event) => {
  const API_KEY = process.env.API_SPORTS_KEY;
  const API_HOST = 'v3.football.api-sports.io';
  const API_BASE_URL = 'https://v3.football.api-sports.io';

  const endpoint = event.path.replace('/api/', '');
  const fullUrl = `${API_BASE_URL}/${endpoint}?${event.rawQuery}`;

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in proxy function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from API' }),
    };
  }
};