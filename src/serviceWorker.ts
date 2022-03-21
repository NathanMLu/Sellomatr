import { initializeStorageWithDefaults } from './storage';

chrome.runtime.onInstalled.addListener(async () => {
    await initializeStorageWithDefaults({});



    // function newOrder() {
    //   console.log("Testing Order")
    //   // Building URL
    //   const url = new URL("https://api.ebay.com/sell/fulfillment/v1/order")
    //   url.searchParams.append("limit", "5");
    //
    //   // orderIds=string&filter=FilterField&limit=string&offset=string&fieldGroups=string
    //
    //   fetch(url.href).then(function(response) {
    //     return response.json();
    //   }).then(function(data) {
    //     console.log(data);
    //   }).catch(function() {
    //     console.log("Server error, unable to grab from eBay API");
    //   });
    // }
    //
    // console.log("aloha");
    // newOrder();

    //authenticateUser();

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