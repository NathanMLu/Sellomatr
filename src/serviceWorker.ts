import {initializeStorageWithDefaults} from './storage';

chrome.runtime.onInstalled.addListener(async () => {
    await initializeStorageWithDefaults({});

    function authenticateUser() {
        const EbayAuthToken = require('ebay-oauth-nodejs-client');

        // Permission scopes for generated token
        const scopes = ['https://api.ebay.com/oauth/api_scope/sell.fulfillment'];

        // Eventually want to get this from Chrome extension storage for security
        const ebayAuthToken = new EbayAuthToken({
            // removed for now, but will be replaced with a real client id
        });

        //const clientScope = 'https://api.ebay.com/oauth/api_scope';
        (async () => {
            //const authToken = await ebayAuthToken.getApplicationToken('PRODUCTION', clientScope);
            //console.log(authToken);

            const options = {state: 'custom-state-value', prompt: 'login'};
            const authUrl = await ebayAuthToken.generateUserAuthorizationUrl('PRODUCTION', scopes, options);
            let accessToken;

            await chrome.tabs.create({url: authUrl}).then(() => {
                chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
                    if (tabId === tab.id && changeInfo.status === 'complete') {
                        try {
                            const token = await ebayAuthToken.exchangeCodeForAccessToken('PRODUCTION', new URL(tab.url).searchParams.get('code'));
                            console.log(typeof token);
                            accessToken = JSON.parse(token).access_token;
                            console.log("Access Token: ", accessToken);

                            console.log("Getting order!");
                            const url = new URL("https://api.ebay.com/sell/fulfillment/v1/order")
                            url.searchParams.append("limit", "5");
                            console.log(url.href);

                            const response = await fetch(url.href, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                }
                            });

                            console.log(response.json());
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            });
        })();
    }

    authenticateUser();

    console.log('Sellomatr has been successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
    for (const [key, value] of Object.entries(changes)) {
        console.log(
            `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
        );
    }
});