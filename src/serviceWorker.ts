import {getStorageItem, setStorageData, setStorageItem} from './storage';

/*
 * Helper Functions
 */

function callback() {
    // TODO: create sync function to update the UI (call only when popup is opened or when token is generated)
    
    getOrders();
}

 async function authenticateUser(refreshToken?: string) {

     // Get the token from the server
     const EbayAuthToken = require('ebay-oauth-nodejs-client');

     const fetchKeys = await fetch('https://sellomatr.herokuapp.com/keys', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json'
         },
         body: JSON.stringify({ })
     })

     const fetchIv = await fetch('https://sellomatr.herokuapp.com/iv', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json'
         },
         body: JSON.stringify({ })
     })

     const fetchSalt = await fetch('https://sellomatr.herokuapp.com/salt', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json'
         },
         body: JSON.stringify({ })
     })

     const encryptedKeys = await fetchKeys.text();
     const iv = await fetchIv.text();
     const salt = await fetchSalt.text();

     //const keys = await JSON.parse(encryptedKeys);
     const CryptoJS = await require("crypto-js");

     // cipher = AES.new(key, AES.MODE_CBC, iv=iv)
     // original_data = unpad(cipher.decrypt(ciphered_data), AES.block_size)
     // const encrypted = CryptoJS.AES.encrypt("TestBird", "test");
     // console.log("Encrypted: ", encrypted.toString());
     //
     // const decrypted = CryptoJS.AES.decrypt(encrypted, "test").toString(CryptoJS.enc.Utf8);
     // console.log("Decrypted: ", decrypted);
     //
     // console.log("Encrypted client_id: ", keys.client_id, " salt: ", salt, " iv: ", iv);
     // const client_id_decrypted = CryptoJS.AES.decrypt(keys.client_id, salt.toString()).toString(CryptoJS.enc.Utf8);
     // console.log("Decrypted: ", client_id_decrypted);

     console.log(encryptedKeys);

     const plaintextArray = await CryptoJS.AES.decrypt(
         {ciphertext:  encryptedKeys},
         salt,
         {iv: iv}
     );

     console.log("Raw decrypted: ", plaintextArray);
     console.log("To String: ", plaintextArray.toString());
     // console.log(plaintextArray.toString(CryptoJS.enc.Utf8));
     //
     // const dcBase64String = plaintextArray.toString(CryptoJS.enc.Base64);
     // console.log("Decrypted: ", dcBase64String);
     // console.log("Decrypted: ", plaintextArray);
     // // plain text array to string
     // // const plaintext = plaintextArray.toString(CryptoJS.enc.Utf8);
     // // console.log("Decrypted: ", {plaintext});
     // // const client_id = JSON.parse(plaintext);
     // console.log("Decrypted: ", plaintextArray.toString());








     // const AESDecrypted = await CryptoJS.algo.AES.createDecryptor(salt, {
     //     iv: iv,
     // });
     //
     // console.log("IV: ", iv, "\nSalt: ", salt, "\nKeys: ", keys);
     //
     // const decryptedKeys = await AESDecrypted.finalize(keys);
     // console.log("Decrypted Keys: ", decryptedKeys);

     // const ebayAuthToken = await new EbayAuthToken({
     //     clientId: AESDecrypted.process(keys.client_id),
     //     clientSecret: AESDecrypted.process(keys.client_secret),
     //     redirectUri: AESDecrypted.process(keys.redirect_uri),
     // });

     const ebayAuthToken = await new EbayAuthToken({
         clientId: 'NathanLu-Sellomat-PRD-16ae2d65c-fa62dee0',
         clientSecret: 'PRD-6ae2d65c31c2-c915-46d1-ab4f-c3d7',
         redirectUri: 'Nathan_Lu-NathanLu-Sellom-wjsurbu'
     });

     // Client scopes
     const scopes = [
         'https://api.ebay.com/oauth/api_scope/sell.fulfillment'
     ];

     if (refreshToken) {
         // Generate access token from refresh token
         const accessToken = await ebayAuthToken.getAccessToken('PRODUCTION', refreshToken, scopes);
         
         await setStorageItem('accessToken', accessToken);
     } else {
         // Generate authorization URL to redirect the user
         const options = {state: 'sellomatr-state', prompt: 'login'};
         const authUrl = await ebayAuthToken.generateUserAuthorizationUrl('PRODUCTION', scopes, options);

         await redirectToLogin(authUrl, ebayAuthToken);
     }
 }
 
async function redirectToLogin(authUrl: string, ebayAuthToken: any) {
    // Create a new window with url
    await chrome.tabs.create({url: authUrl}).then(() => {
        chrome.tabs.onUpdated.addListener(createTokens);
        async function createTokens(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                // Get code from oauth redirect
                const code = new URL(tab.url).searchParams.get('code')

                if (code) {
                    try {
                        // Generate access token once we have the code
                        const token = await ebayAuthToken.exchangeCodeForAccessToken('PRODUCTION', code);
                        const accessToken: string = JSON.parse(token).access_token;
                        const refreshToken: string = JSON.parse(token).refresh_token;

                        // Save the tokens to storage
                        await setStorageData({
                            'accessToken': accessToken,
                            'refreshToken': refreshToken
                        });

                        // Close tabs and remove listener
                        chrome.tabs.onUpdated.removeListener(createTokens);
                        await chrome.tabs.remove(tabId);
                        console.log("Successfully signed into eBay!");

                        // Callback
                        callback();

                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        }
    });
}

function getOrders() {
    const url = new URL("https://api.ebay.com/sell/fulfillment/v1/order")
    url.searchParams.append("limit", "5");

    (async () => {
        const accessToken = await getStorageItem('accessToken');

        const response = await fetch(url.href, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const orders = await response.json();
        console.log(orders);
        const item = orders.orders[0].orderId;
        console.log(item);

    })();
}


/*
 * On extension install
 */

chrome.runtime.onInstalled.addListener(async () => {
    await authenticateUser();

    console.log('Sellomatr has been successfully installed!');
});


/*
 * DEVELOPMENT ONLY, NEVER PUT THIS IN PRODUCTION
 */

// Log storage changes, might be safely removed
// chrome.storage.onChanged.addListener((changes) => {
//     for (const [key, value] of Object.entries(changes)) {
//         console.log(
//             `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
//         );
//     }
// });