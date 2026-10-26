import { browser, $, $$, expect } from '@wdio/globals';
import { randomUUID } from 'node:crypto';
const password='DemoPass42!'; let username:string;
async function home() { await browser.url((process.env.PARABANK_URL || 'https://parabank.parasoft.com/parabank')+'/index.htm'); }
async function form(mismatch=false) {
  await home(); await $('a=Register').click();
  for(const [id,value] of Object.entries({"customer.firstName": "Automation", "customer.lastName": "Example", "customer.address.street": "123 Fictional Street", "customer.address.city": "Demo City", "customer.address.state": "CA", "customer.address.zipCode": "90210", "customer.phoneNumber": "5551234567", "customer.ssn": "123456789"})) await $('[id="'+id+'"]').setValue(value);
  await $('[id="customer.username"]').setValue(username); await $('[id="customer.password"]').setValue(password); await $('#repeatedPassword').setValue(mismatch?'Different42!':password);
}
async function submit() { await $('#customerForm input[type=submit]').click(); }
async function register() { await form(); await submit(); await expect($('#rightPanel h1')).toHaveText('Welcome '+username); }
async function login() { await $('input[name=username]').setValue(username); await $('input[name=password]').setValue(password); await $('#loginPanel input[type=submit]').click(); }
describe('ParaBank customer journeys',()=> {
  beforeEach(async()=> { await browser.deleteCookies(); username='qa'+randomUUID().replaceAll('-','').slice(0,18); });
  it('register customer',async()=> { await register(); });
  it('logout and login',async()=> { await register(); await $('a=Log Out').click(); await login(); await expect($('#rightPanel h1')).toHaveText('Accounts Overview'); });
  it('required fields',async()=> { await home(); await $('a=Register').click(); await submit(); await expect($('[id="customer.firstName.errors"]')).toHaveText('First name is required.'); });
  it('password mismatch',async()=> { await form(true); await submit(); await expect($('[id="repeatedPassword.errors"]')).toHaveText('Passwords did not match.'); });
  it('unknown credentials',async()=> { await home(); await login(); await expect($('#rightPanel .error')).toHaveText('The username and password could not be verified.'); });
  it('open a savings account',async()=> { await register(); await $('a=Open New Account').click(); await browser.waitUntil(async()=> (await $$('#fromAccountId option')).length>0); await $('#type').selectByAttribute('value','1'); await $('#openAccountForm input.button').click(); await expect($('#newAccountId')).toHaveText(/^[0-9]+$/); const id=await $('#newAccountId').getText(); await $('#newAccountId').click(); await expect($('#accountId')).toHaveText(id); await expect($('#accountType')).toHaveText('SAVINGS'); });
});
