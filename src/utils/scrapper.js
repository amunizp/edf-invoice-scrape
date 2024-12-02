require('dotenv').config()
const puppeteer = require('puppeteer')
const fs = require('fs')

let listOfAccounts = []
let accountCount = 0
let listOfPDFs = []

const Scrapper = async (url) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized'],
      defaultViewport: null
    })
    const page = await browser.newPage()
    await page.goto(url)
    console.log('Page open!')
    logInEDF(page, browser)
    getAccounts(page, browser, url)

    // await browser.close()
  } catch (error) {
    console.error(error)
  }
}

const getAccounts = async (page, browser, url) => {
  await page.locator('tr').wait()
  console.log('List of accounts page loaded', url)
  let currentAccounts = await page.$$eval('td > p.sc-eauhAA.efjsHa', (texts) =>
    texts.map((e) => e.textContent)
  )
  currentAccounts = currentAccounts.filter((item) => item !== 'ACTIVE')
  listOfAccounts = listOfAccounts.concat(currentAccounts)
  try {
    const enabled = await page
      .locator('aria/Next page[role="button"]')
      .map((button) => !button.disabled)
      .wait()
    console.log('Next page enabled?', enabled)
    if (enabled) {
      await page.locator('aria/Next page[role="button"]').click()
      getAccounts(page, browser, url)
    } else {
      for (const account of listOfAccounts) {
        // const accountPage = await browser.newPage()
        await page.goto(`${url}accounts/${account}/bills-and-payments`)
        await page.locator('button.sc-ciFVpn.bdCjIk').wait()
        // click invoices button
        await page.locator('button.sc-ciFVpn.bdCjIk').click()
        //get the first document that can be downloaded form the list.
        const linkToPDF = await page
          .locator('a.sc-fAUdSK.iZGISN')
          .map((el) => el.href)
          .wait()
        listOfPDFs.push(linkToPDF)
      }
    }
    console.log(listOfPDFs)
  } catch (error) {
    console.log(
      'finished all pages and got an error for not finding the next one',
      error
    )
  }
  fetchPDFs(listOfPDFs)
}
const fetchPDFs = async () => {
  // listOfPDFs.forEach((url, index) => {
  console.log(
    `number of accounts ${listOfAccounts.length}  number of invoices ${listOfPDFs.length}`
  )
  for (const [index, url] of listOfPDFs.entries()) {
    const pdfResponse = await fetch(url)
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const binaryPdf = Buffer.from(pdfBuffer)
    fs.writeFileSync(`${listOfAccounts[index]}.pdf`, binaryPdf, 'binary')
  }
  // for (const url of listOfPDFs) {

  // }
}
const logInEDF = async (page, browser) => {
  ignoreCookies(page)
    .then((result) => {
      populateLogin(page)
      console.log('You are logged in!')
    })
    .catch((err) => {
      console.log('Tried to fill in logs but failed ', error)
    })
}
const populateLogin = async (page) => {
  console.log('Populating Login')
  await page.locator('input[name="email"]').fill(process.env.email)
  await page
    .locator('input[id="Password"]')
    .fill(process.env.password + String.fromCharCode(13))
  // await page.locator('input[type="checkbox" name="rememberMe"]').click()
}

const ignoreCookies = async (page) => {
  console.log('Ignoring cookies')
  try {
    await page.locator('button[id="onetrust-pc-btn-handler"]').click()
    await page
      .locator(
        'button[class="save-preference-btn-handler onetrust-close-btn-handler"]'
      )
      .click()
  } catch (error) {
    console.log('Tried clicking through cookie thing but got an error', error)
    return false
  }
}
module.exports = { Scrapper }
