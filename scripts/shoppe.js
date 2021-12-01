const puppeteer = require('puppeteer');
const autoScroll = require('puppeteer-autoscroll-down');
const xlsx = require('xlsx')
const wait =  (sec)=>{
    return new Promise(resolve=>{
        setTimeout(resolve, sec * 1000)
    })
}

module.exports.scrapingScript = async(searchTerm)=>{
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"]
    })
    const page = await browser.newPage();
    await page.setViewport({
        width: 1400,
        height: 1000,
        deviceScaleFactor: 1,
      });
      await page.exposeFunction("wait", wait)
      try{
        await page.goto('https://shopee.com.my/')
        await wait(3)
        await page.click('.shopee-searchbar-input__input')
        await page.type('.shopee-searchbar-input__input', searchTerm)
       await page.keyboard.press('Enter');
        await wait(3)
        await autoScroll(page)
        await wait(3)
        const data = await page.evaluate(async()=>{
            const allData = [];
            const allProducts = document.querySelectorAll('._3QUP7l')
            for(let i = 0; i < allProducts.length; i++){
                let productName = allProducts[i].querySelector('._5SSWfi.UjjMrh').textContent.trim();
                let price = allProducts[i].querySelector('._1d9_77').textContent
                let image = allProducts[i].querySelector('img').src;
                allData.push({
                        productName: productName,
                        price: price,
                        image: image
                    })
            }
            console.log(allData)
            Downloadify.create(id,{
                /* other options are required! read the downloadify docs for more info */
                filename: "test.xlsx",
                data: function() { return XLSX.write(allData, {bookType:"xlsx", type:'base64'}); },
                append: false,
                dataType: 'base64'
            });
            
        // const newWB = xlsx.utils.book_new();
        // const newWS = xlsx.utils.json_to_sheet(allData);
        // xlsx.utils.book_append_sheet(newWB, newWS, "allData");
        // xlsx.writeFile(newWB, 'last.xlsx');
            return allData
    
        })
        await browser.close()
        return data;
      }catch(e){
          console.log(e)
          await browser.close()
      }

}