/* eslint-disable @typescript-eslint/no-explicit-any */
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
     const ebayAuthToken = new EbayAuthToken({
         // Hidden for obvious reasons ;-;
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