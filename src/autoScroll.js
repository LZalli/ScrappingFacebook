async function autoScroll(page){
    await page.evaluate(async () => {
   
        await new Promise((resolve )=> {
            var totalHeight = 0;
            var distance = 45 ;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight > scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    });
}
module.exports = autoScroll;