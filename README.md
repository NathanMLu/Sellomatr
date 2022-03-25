# Sellomatr

Sellomatr is a Chrome extension that helps you automate your online eBay store. 
When a buyer purchases a product from your store, Sellomatr will automatically 
handle everything you would normally do to fulfill the order. 

## Features

_When a buyer purchases an item:_
- [ ] Updates sales information on a generated spreadsheet
- [ ] Generates and prints a shipping label
- [ ] Emails the buyer that the order is confirmed

_When you search for new inventory:_
- [ ] Analyzes site to estimate profits and risk and generate a "score"
- [ ] Generates a detailed spreadsheet with per-item statistics
- [ ] Compares per unit prices to determine which items are more profitable
- [ ] Scans the latest eBay sales of each item to estimate ROI

_When you list a new item:_
- [ ] Generates a description based on past orders
- [ ] Upload images to eBay listing from your local storage
- [ ] Updates spreadsheet to add new listing

### _**And much more!**_

## Installation
_Pending public release on Chrome Web Store._

1. Clone the repository
2. Run `npm install`
3. Run `npm run start` for development mode, `npm run build` for production build
4. Add the extension to Chrome:
    1. Go to `chrome://extensions/`
    2. Enable the `Developer mode`
    3. Click on `Load unpacked`
    4. Choose the `dist` directory
5. You are good to go! You can also pin the extension to the toolbar for easy access.

## Technologies Used
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [eBay API](https://developer.ebay.com/)
- [Sheets API](https://developers.google.com/sheets/api/)
- [Kiosk Printing](https://developer.chrome.com/docs/extensions/reference/printerProvider/)
- [Axios](https://axios-http.com/docs/intro)
- [Webpack 5](https://webpack.js.org)
- [TypeScript](https://www.typescriptlang.org)
- [Sass](https://sass-lang.com)
- [Babel](https://babeljs.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Usage
Add screenshots and other info here, maybe a video.
Show options and popup, login flow, etc.

## License
[GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html)



# Just ignore this other stuff :0
# Popup

- Daily/monthly/yearly earnings
- Include link for calculator
- Include spreadsheet link

# Options

- Input all API keys
- Change confirmation message for each order (make personal)
