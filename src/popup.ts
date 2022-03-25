import '../styles/popup.scss';


/**
 * Helper Functions
 */

function updateAll(profit: number, goal: number, choice: number) {
    setProfit(String(profit));
    setProfitTime(choice);
    setProfitGoal(String(goal));
    setPercentage(String(calculatePercentage(profit, goal)));
}

// Exclusive, getRandomInt(4) = 0, 1, 2, 3
function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

function setPercentage(percentage: string) {
    const profitBar = document.getElementById('profit-bar');
    profitBar.style.setProperty('--value', percentage);
    profitBar.style.animation = 'none';
    profitBar.offsetHeight;
    profitBar.style.animation = null;
}

function setProfit(profit: string) {
    const num = Number(profit).toFixed(2);
    document.getElementById('profit-today').innerText = String(num);
}

function setProfitGoal(profit: string) {
    const num = Number(profit).toFixed(2);
    document.getElementById('profit-goal').innerText = String(num);
}

function setProfitTime(choice: number) {
    if (choice == 1) {
        document.getElementById('profit-time').innerText = 'Profit Today';
    } else if (choice == 2) {
        document.getElementById('profit-time').innerText = 'Profit This Week';
    } else if (choice == 3) {
        document.getElementById('profit-time').innerText = 'Profit This Month';
    }
}

function calculatePercentage(profit: number, goal: number) {
    return Math.round((profit / goal) * 100);
}


/**
 * Listeners
 */

document.getElementById('sync-settings').addEventListener('click', () => {
    // console.log("Client requested sync");
    try {
        chrome.runtime.sendMessage({
            method: 'sync',
        });
    } catch (e) {
        console.log(e);
    }
    return true;
});

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    if (request) {
        if (request.method == 'sync') {
            // console.log("Request updateAll with data:" + request.data);
            console.log(request.data.profit, request.data.goal, request.data.choice);
            updateAll(request.data.profit, request.data.goal, request.data.choice);
        }
    }
    return true;
});


/*
 * Popup Buttons
 */

document.getElementById('big-title').addEventListener('click', () => {
    const sellomatrURL = "https://github.com/NathanMLu/Sellomatr";
    chrome.tabs.create({url: sellomatrURL}).then(r =>
        console.log(r)
    );
})

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

// document.getElementById('open-calculator').addEventListener('click', () => {
//     const calculatorURL = "https://docs.google.com/spreadsheets/d/1MDSxxPRpJI7fpQgjq1vVuPt6wos-gYPfp1TBlAKNxpY/edit#gid=154520879";
//     chrome.tabs.create({url: calculatorURL}).then(r =>
//         console.log(r)
//     );
// });
