//its-MohitYadav
//node Automation.js --url="https://www.hackerrank.com" --config=config.json

let minimist=require("minimist");
let args=minimist(process.argv);
let fs=require("fs");
let puppeteer=require("puppeteer");


let configJSON=fs.readFileSync(args.config); //reading JSON file
let config=JSON.parse(configJSON);           // converting into JSO so that we can access data from it

async function tryit(){
    let browser=await puppeteer.launch({
        headless:false,
        args: ['--start-maximized'],
        defaultViewport:null,
        slowMo:100
    });
    
    let pages=await browser.pages();
    let page=pages[0];
    await page.goto(args.url);
    
    //LOGIN-1
    await page.click("li#menu-item-2887");

    //LOGIN-2
    await page.waitForSelector("a.fl-button[href='https://www.hackerrank.com/login']");
    await page.click("a.fl-button[href='https://www.hackerrank.com/login']");

    //typing (id,pass) and login
    await page.waitFor(2000);
    await page.waitForSelector("input[placeholder='Your username or email']");
    await page.type("input[placeholder='Your username or email']",config.uid);
    await page.type("input[placeholder='Your password']",config.pass);
    await page.click("button[data-analytics='LoginPassword']");

    //click on contests
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    //click manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    //collecting list of urls of all contests on a single page
    await page.waitFor(3000);
    //getting total no of pages of contests by clicking on right most button
    await page.waitForSelector("a[data-attr1='Last']");
    let totPg=await page.$eval("a[data-attr1='Last']",function(atag){  //$eval is like queryselector()
        let pg=parseInt(atag.getAttribute("data-page"));             
        return pg;
    })
    // above loop has given total no of pages in totPg
    for(let i=1;i<=totPg;i++){
        await CollectAllUrlsAndOpeningThem(page,browser);
        if(i<totPg){
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }
       
    }
   
    
    await browser.close();
    console.log("phew!");
}
tryit();
async function CollectAllUrlsAndOpeningThem(page,browser){
    await page.waitForSelector("a.backbone.block-center");
    let curls=await page.$$eval("a.backbone.block-center",function(atags){
        let urls=[];
        for(let i=0;i<atags.length;i++){
            let url=atags[i].getAttribute("href");
            urls.push(url);
        }
        return urls;
    });
    for(let i=0;i<curls.length;i++){
        let ctab=await browser.newPage();
        await ctab.bringToFront();
        await ctab.goto(args.url+curls[i]);
        await singlePgKaModerator(ctab,config.moderator);
        await ctab.waitFor(1000);
        ctab.close();
        await page.waitFor(2000);
    }
}
async function singlePgKaModerator(ctab,moderator){
    
    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");

    await ctab.waitForSelector("input#moderator");
    await ctab.type("input#moderator",moderator);

    await ctab.keyboard.press("Enter");
}