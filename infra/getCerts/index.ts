// import * as https from 'https';
import * as fs from 'fs';

const porkbunDomain = 'scriptsifter.com';
const porkbunApiKey = process.env.PORKBUN_API_KEY;
const porkbunSecretApiKey = process.env.PORKBUN_SECRET_API_KEY;
const certFilename = '../traefik/certs/cert.pem';
const keyFilename = '../traefik/certs/key.pem';


const apiRequest = async () => {
  const postData = JSON.stringify({
    secretapikey: porkbunSecretApiKey,
    apikey: porkbunApiKey
  });

  try {
    const response = await fetch(`https://porkbun.com/api/json/v3/ssl/retrieve/${porkbunDomain}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData
    });

    if (!response.ok) {
      throw new Error(`Porkbun API error: HTTP status ${response.status}`);
    }

    const responseData = await response.json();
    if (responseData.status !== 'SUCCESS') {
      throw new Error('Porkbun API error: ' + responseData.message || 'Unknown error');
    }

    fs.writeFileSync(certFilename, responseData.certificatechain);
    fs.writeFileSync(keyFilename, responseData.privatekey);
    console.log('Certificates updated from Porkbun');

  } catch (error) {
    console.error('Error updating certificates:', error);
  }
}

apiRequest();
