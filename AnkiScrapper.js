import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; // An example plugin
import readline from 'readline';
import fs from 'fs';
// Add plugins to Puppeteer
puppeteer.use(StealthPlugin());

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const lines = data.trim().split('\n');
        const wordsArray = lines.map(line => {
          const [koreanPart, ...englishParts] = line.split(' ');
          const koreanWord = koreanPart;
          const englishWords = englishParts.join(' ');
          return { koreanWord, englishWords };
        });
        resolve(wordsArray);
      }
    });
  });
};

async function processWords(page, wordsArray) {
  if (wordsArray.length === 0) {
    return;
  }

  const [currentWord, ...remainingWords] = wordsArray;

  let formFields = await page.$$('.form-group');
  const button = await page.$('.btn');

  for (let j = 0; j < formFields.length; j++) {
    const englishWords = currentWord.englishWords;
    const koreanWord = currentWord.koreanWord;

    const childForm = await formFields[j].$('.form-control');
    if (j === 2) {
      await childForm.type(englishWords);
    } else if (j === 3) {
      await childForm.type(koreanWord);
    }
  }

  await button.click();
  await page.waitForTimeout(250);

  // Recursively call processWords for the remaining words
  await processWords(page, remainingWords);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false, ignoreHTTPSErrors: true});
  const page = await browser.newPage();

    await page.goto('https://ankiweb.net/account/login');
    const wordsArray = await readFileAsync('output.txt');

    rl.question('Press Enter to continue...', async () => {
      processWords(page, wordsArray);
    });
})();
