# edf-invoice-scrape

A way to download edf invoices. specially useful when you have several and you need the PDF for your accountant.

## installation instructions

Download the git repo.
Install npm and install node.
Move the the root of folder where this readme file is. `npm -y init` and install dependencies `npm i pupeteer `.
for some reason `npm i dotenv` is not needed? might be that it is included in default node init or pupeteer

create a file called `.env` and put

> email=[your@email.log]

> password=[yourPassword]

confirm you are connected to the internet.
Run: `npm run test`

## Literature review

- https://github.com/yottatsa/edfenergyapi issue by @pacmac shows it does not work
- https://github.com/waynemoore/edfenergy-api/blob/master/README.md ruby does not build following instructions
- https://opendata.edf.fr/explore/?disjunctive.theme&disjunctive.publisher&disjunctive.keyword&sort=modified EDF provided API but seems focused on france and it is more company details rather than individual company supplies.
- https://pypi.org/project/edf-api/ links to https://github.com/droso-hass/edf-api stating it depreciated.
- https://www.reddit.com/r/homeassistant/comments/12bcwc6/scrape_energy_edf_enr_js_javascript/ and https://community.home-assistant.io/t/importing-data-from-edfenergy-uk/769739/2 seem to suggest better move to supplier than attempt this.
- https://opendata-corse.edf.fr/pages/home0/ seems to provide information of energy usage but not particular invoices.
- https://pptr.dev/guides/page-interactions this seems to be the way to go. Sadly start from scratch!

## What I would like to have.

a simple interface that will automatically open a browser. Invite you to log in on said page for example: https://edfenergy.com/myaccount/login
and it will then go through all the accounts and download the latest invoice on your account.

This could be an easy way for residents to request block owner about their enviormental impact: https://fixmyblock.org/category/letters/

### Things to take into account.

- Login in: First cookies, adjust `<button id="onetrust-pc-btn-handler">Choose which cookies to accept or reject</button> and then <button class="save-preference-btn-handler onetrust-close-btn-handler" tabindex="0">Confirm My Choices</button>`. log in: `<input name="email" aria-describedby="emailaddress-error-message" maskplaceholder="" type="text" placeholder="example@domain.com" role="textbox" id="Email address" class="sc-eYqbKq ffmpbs">` & `<input id="Password" aria-describedby="password-error-message" type="password" placeholder="password" name="password" role="textbox" class="sc-kLgwYS kCTZdM">` probably works with pressing enter at this point. But extra points to "remember me" `<input type="checkbox" name="rememberMe" aria-label="Remember me" class="sc-leZKAP kohlqK">` and/or `<button type="submit" aria-label="Log in" class="sc-bqWyeZ dErQNR" style="margin-top: 56px;"><div class="sc-ksBlXE ignHmI">Log in</div></button>`
- the list of accounts comes form the https://edfenergy.com/myaccount/ page the item of interest is `<button id="[A-AccountNumber]" type="button" class="sc-jSVask sJJJZ sc-gKPSgB eaBpLt">(...)</button>` at the bottom of the page there is `<button type="button" style="width: 48px; height: 48px; padding: 0px;" aria-label="Next page" class="sc-bqWyeZ etxDZY"><div class="sc-ksBlXE ignHmI"></button>` which will check the next page. use the aria-label next page until it is disabled. or if the length of the rows is less than 10.
  NEW RULE: IF ARIA EXISTS USE ARIA TO CONFORM WITH ACCESABILITY!
  -After you access the account you go to a page https://edfenergy.com/myaccount/accounts/[A-Account number] which has an `<a id="Payments and invoices-icon-electricity">` or better yet directly to https://edfenergy.com/myaccount/accounts/${account}/bills-and-payments.
- Then you go into a new page where we have to activate the invoices tab: `<button role="tab" aria-selected="false" class="sc-jwKcHQ fHpHIM">Invoices</button>` I NOTICE THAT THIS MIGHT BE CALLED BILLS INSTEAD OF INVOICES!

- I have noticed that the top most invoice is not always the latest especially if it ammends it. EG a credit note.
- the `<a>` tag that holds the link to the pdf that is hosted on AWS has the following format for invoice: id="KI-[your account number goes here]-XXXX" where XXXX is a number [0001, 0002]. not sure what will happen when we reach 9999 but I will let someone else worry about that. Credit Notes follow a similar format: id="KCR-[your account number goes here]-XXXX".
- if you have an old format invoice it now (2024) shoes the `<a>` id="xxxxxxxx" where x is a number that seems to be ascending as it gets older. The first few digits stay fix your milage may vary.
- the invoice list is nested in several `<div>` that have a name similar to class="sc-juxSla dUJHUE" under a parent class="sc-gFvcKV jXQLCv" it self nested in style="margin-top: 40px;".
- `<div class="sc-juxSla dUJHUE">` contains two `<p>` which detail date range and if it is an invoice or credit note or something else and a `<div class="sc-gDiSof jiLwMl">` that contains the `<a>` of interest. with the href to download the PDF.
- After accessing an account the URL looks like: https://edfenergy.com/myaccount/accounts/A-[yourAccountNumber]/bills-and-payments, to move to another account you will need to press back. `<button aria-label="Back" type="button" class="sc-jSVask sJJJZ sc-gKPSgB eaBpLt"></button>` and then go to switch accounts: `<button type="button" class="sc-jSVask sJJJZ sc-gKPSgB eaBpLt"><span class="sc-iBYPxa eYkkMV">(...)Switch accounts</span></button>` where a side menu shows again `<button id="[A-AccountNumber]" type="button" class="sc-jSVask sJJJZ sc-gKPSgB eaBpLt">(...)</button>` to continue down the list of accounts.
- a more ideal path probalby is to extract the list of accounts and generate the URL `https://edfenergy.com/myaccount/accounts/A-[yourAccountNumber]/bills-and-payments` after each invoice is downloaded.
