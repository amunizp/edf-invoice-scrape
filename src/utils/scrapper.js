require('dotenv').config()
const puppeteer = require('puppeteer')
const fs = require('fs')

const componentArray = []
let pageCount = 1

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
  } catch (error) {
    console.error(error)
  }
}
const logInEDF = async (page, browser) => {
  ignoreCookies(page)
    .then((result) => {
      populateLogin(page)
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
