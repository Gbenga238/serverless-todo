// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'gfbg12lqwg'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-xogasgaywzob87jm.us.auth0.com',            // Auth0 domain
  clientId: 'oXNZ1rvmKSWESv0AdoLibFykx2Q0TNXt',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}