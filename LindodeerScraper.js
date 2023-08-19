import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; // An example plugin
import creds from './login';
import readline from 'readline';
const path = require('path');
import fs from 'fs';
import { setTimeout } from 'timers/promises';
// Add plugins to Puppeteer
puppeteer.use(StealthPlugin());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false, ignoreHTTPSErrors: true});
   const page = await browser.newPage();
  

{
    await page.goto('https://www.lingodeer.com/learn-languages/kr/en/learn-korean-online');
    let links = [];
    let unitWrapElements = await page.$$('.topWrap .unitDetail .unitName');
    if(unitWrapElements) {
      for(const element of unitWrapElements)
      {
        const unitName = await element.evaluate(el => el.textContent.trim());
        links.push(unitName);
      }
    }

   rl.question('Press Enter to continue...', async () => {
      rl.close();
      unitWrapElements = await page.$$('.topWrap .unitDetail .unitName');
      let num = 0;
      let pairs = [];
      for(const nameToFind of links)
      {
        
        let foundElement = null;
        let unitName = "";
        for(const unitWrapElement of unitWrapElements)
        {
          unitName = await unitWrapElement.evaluate(el => el.textContent.trim());
          if (unitName === nameToFind) {
            foundElement = unitWrapElement;
            break; // Exit the loop once the element is found

          }
        }
        
        if (foundElement) {
          await foundElement.click();
          await new Promise(r => setTimeout(r, 1000)); 
          unitWrapElements = await page.$$('.topWrap .unitDetail .unitName');

          const parentDiv = await page.$('.unitDetailItemArea.vacabulary');
          if (parentDiv) 
          {
            const childDiv = await parentDiv.$('.wrap');
            await childDiv.click(`img[src="https://webjson.lingodeer.com/mediaSource/static/images/vocabularyPic/vocabulary.png"]`);

            await new Promise(r => setTimeout(r, 5000)); //wait for data to load. 

            saveTextToFile(page);
            
          }
          await page.goBack();
          await new Promise(r => setTimeout(r, 1000)); 
          unitWrapElements = await page.$$('.topWrap .unitDetail .unitName');
        } 
      }
      fs.writeFileSync('output.txt', pairs.join('\n'));
      browser.close();
    
    });
}
})();
async function saveTextToFile(page)
{
    const wdTxtElements = await page.$$('.wdTxt'); 
    const wdTxtText = await Promise.all(
      wdTxtElements.map(async element => {
        return await  element.evaluate(el => el.textContent);
        
      })
    );
    const trElements = await page.$$('.tr');
    const trText = await Promise.all(
      trElements.map(async element => {
        return await element.evaluate(el => el.textContent);
      })
    );
    
    for (let i = 0; i < wdTxtText.length; i++) {
      const original = wdTxtText[i].trim();
      const translated = trText[i].trim();
      pairs.push(`${original} ${translated}`);
    }
}
