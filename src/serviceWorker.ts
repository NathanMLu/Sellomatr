import {getStorageItem, setStorageData, setStorageItem} from './storage';

const CryptoJS = require("crypto-js");

/*
 * Helper Functions
 */

function callback() {
    getOrders();
}

function decrypt(encrypted: string, iv: string, salt: string): string {
    // console.log("Decrypting...");
    // console.log("encrypted: " + encrypted + " iv: " + iv + " salt: " + salt);

    iv = CryptoJS.enc.Utf8.parse(iv);
    salt = CryptoJS.enc.Utf8.parse(salt);

    let decrypted = CryptoJS.AES.decrypt(encrypted, salt, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
    });

    // console.log("Decrypted: " + decrypted);
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    // console.log("Decrypted (parsed): " + decrypted);

    return decrypted;
}

async function authenticateEbayUser(refreshToken?: string) {

    // Get the token from the server
    const EbayAuthToken = await require('ebay-oauth-nodejs-client');

    const fetchKeys = await fetch('https://sellomatr.herokuapp.com/keys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    })

    const ek = await fetchKeys.text();
    const encryptedKeys = await JSON.parse(ek);

    // console.log("clientId: ", decrypt(encryptedKeys.client_id, iv, salt), "clientSecret: ", decrypt(encryptedKeys.client_secret, iv, salt), "redirectUri: ", decrypt(encryptedKeys.redirect_uri, iv, salt));

    const ebayAuthToken = await new EbayAuthToken({
        clientId: decrypt(encryptedKeys.client_id, encryptedKeys.iv, encryptedKeys.salt),
        clientSecret: decrypt(encryptedKeys.client_secret, encryptedKeys.iv, encryptedKeys.salt),
        redirectUri: decrypt(encryptedKeys.redirect_uri, encryptedKeys.iv, encryptedKeys.salt),
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
        const options = {state: 'sellomatr-state'};
        //, prompt: 'login'
        const authUrl = await ebayAuthToken.generateUserAuthorizationUrl('PRODUCTION', scopes, options);

        await redirectToEbayLogin(authUrl, ebayAuthToken);
    }
}

async function redirectToEbayLogin(authUrl: string, ebayAuthToken: any) {
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

                        callback();

                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        }
    });
}

async function authenticateSheetsUser() {
    const {OAuth2Client} = require('google-auth-library');

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
        //console.log(orders);
        const item = orders.orders[0].orderId;
        console.log("Latest Order ID:" + item);

    })();
}


/*
 * Listeners
 */

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    if (request) {
        if (request.method == 'sync') {
            sendResponse({
                success: true,
                profit: 20.293847,
                goal: 227.824,
                choice: 2,
            });
        }
    }
    return true;
});

chrome.runtime.onInstalled.addListener(async () => {
    await authenticateEbayUser();

    console.log('Sellomatr has been successfully installed!');
    return true;
});


/*
 * DEVELOPMENT ONLY, NEVER PUT THIS IN PRODUCTION
 */

chrome.storage.onChanged.addListener((changes) => {
    for (const [key, value] of Object.entries(changes)) {
        console.log(
            `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
        );
    }
});