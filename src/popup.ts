import '../styles/popup.scss';

/**
 * Event Listeners
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

document.getElementById('open-calculator').addEventListener('click', () => {
    // const calculatorURL = "https://docs.google.com/spreadsheets/d/1MDSxxPRpJI7fpQgjq1vVuPt6wos-gYPfp1TBlAKNxpY/edit#gid=154520879";
    // chrome.tabs.create({url: calculatorURL}).then(r =>
    //     console.log(r)
    // );
    const num = getRandomInt(100)
    console.log(num)
    setPercentage(String(num));
});


/**
 * Helper Functions
 */

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

function setPercentage(percentage: string) {
    const profitBar = document.getElementById('profit-bar');
    profitBar.style.setProperty('--value', percentage);
}

function setProfit(profit: string) {
    document.getElementById('profit-today').innerText = profit;
}

function setProfitTime(profit: number) {
    if (profit == 1) {
        document.getElementById('profit-time').innerText = 'Profit Today';
    } else if (profit == 2) {
        document.getElementById('profit-time').innerText = 'Profit This Week';
    } else if (profit == 3) {
        document.getElementById('profit-time').innerText = 'Profit This Month';
    }
}

function setProfitGoal(profit: string) {
    document.getElementById('profit-goal').innerText = profit;
}

function calculatePercentage(profit: number, goal: number) {
    const percentage = ((profit / goal) * 100).toFixed(2);
    console.log(percentage);
    return percentage;
}


/**
 * Test Functions
 */

console.log('test');
setPercentage(calculatePercentage(250, 279));

console.log("test2");
setProfit("1000");

console.log("test3");
setProfitTime(3);

console.log("test4");
setProfitGoal('279');

console.log("test5");
setPercentage(calculatePercentage(1, 9));