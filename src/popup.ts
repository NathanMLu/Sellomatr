import '../styles/popup.scss';

document.getElementById('open-spreadsheet').addEventListener('click', () => {
    const spreadSheetURL = "https://docs.google.com/spreadsheets/d/1Ps3S6bI24d-dK7UHJ6cOop9g7pkSgKNLbte9OJerOSw/edit#gid=0";
    chrome.tabs.create({url: spreadSheetURL}).then(r =>
        console.log(r)
    );
});

document.getElementById('open-ebay').addEventListener('click', () => {
    const ebayURL = "https://www.ebay.com/sh/ord/?filter=status:ALL_ORDERS";
    chrome.tabs.create({url: ebayURL}).then(r =>
        console.log(r)
    );
});

document.getElementById('open-calculator').addEventListener('click', () => {
    const calculatorURL = "https://docs.google.com/spreadsheets/d/1MDSxxPRpJI7fpQgjq1vVuPt6wos-gYPfp1TBlAKNxpY/edit#gid=154520879";
    chrome.tabs.create({url: calculatorURL}).then(r =>
        console.log(r)
    );
});
// document.getElementById('go-to-options').addEventListener('click', () => {
//     chrome.runtime.openOptionsPage();
// });
