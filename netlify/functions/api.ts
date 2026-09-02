import { handleApiRequest, ApiRequest } from '../../src/server/apiHandler';

export const handler = async (event: any, context: any) => {
  let bodyData: any = undefined;
  if (event.body) {
    try {
      bodyData = JSON.parse(event.body);
    } catch {
      bodyData = event.body;
    }
  }

  // Normalize path from Netlify
  let path = event.path || '';
  if (path.startsWith('/.netlify/functions/api')) {
    path = path.replace('/.netlify/functions/api', '');
  }

  const req: ApiRequest = {
    method: event.httpMethod || 'GET',
    path: path || '/',
    headers: event.headers || {},
    body: bodyData,
    query: event.queryStringParameters || {}
  };

  const response = await handleApiRequest(req);

  return {
    statusCode: response.statusCode,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: response.body
  };
};
