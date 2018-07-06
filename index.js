const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => {
  return new Promise(resolve => {
      setTimeout(resolve,ms)
  })
}

const writeFile = (filePath, obj) => {
  let txtFile = path.join(__dirname, filePath); 
  let json_file = JSON.stringify(obj);
   fs.writeFile(txtFile, json_file, function(err) {
    if (err) {
        return console.error(err);
    }
    console.log("The file was saved!");
  });
} 


const scrapeUsNewsRanking = async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()

  await page.goto('https://www.usnews.com/best-colleges/rankings/national-universities?_mode=table')

  for (let i = 0; i < 30; i++) {
    page.keyboard.down("PageDown");
    page.keyboard.up("PageDown")
    await sleep(500);
  }

  await page.waitFor(1000);

  const result = await page.evaluate(() => {
    let data = [];

    let elements = document.querySelectorAll('tr')
    for (let element of elements){ // Loop through each cell
      if (element.childNodes[1].className === 'full-width') {
        let schoolName = element.childNodes[1].childNodes[1].innerText
        let location = element.childNodes[1].childNodes[3].innerText
        let ranking = element.childNodes[1].childNodes[5].innerText.match(/\d+/)[0]
        let tuition = element.childNodes[3].innerText
        let enrollment = element.childNodes[5].innerText
        data.push({schoolName, location, ranking, tuition, enrollment})
      }
    }

    return data
  })
  browser.close()
  return result
}

scrapeUsNewsRanking().then((value) => {
  writeFile('/usnewsranking.txt', value)
});


