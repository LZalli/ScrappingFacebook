let autoScroll = require('./autoScroll.js');
let login = require('./login/login.js');
const puppeteer =  require ("puppeteer");
let Product = require('./Product.js');
const urlPages = require('./postsPages.js');
var fs = require('fs');
var cron = require('node-cron');
const lineReplace = require('line-replace')
let pagesfb = ['lepidor','diari.tunisie' , 'aoulatunisia' ];
let postsfb = [ urlPages.lepidor ,urlPages.diari ,urlPages.aoula ];
var MongoClient = require('mongodb').MongoClient;





     

    let url = `https://www.facebook.com/`;
    (async () => {
    
        const browser = await puppeteer.launch({ headless: false , defaultViewport: null, 
            args: [
                "--disable-notifications" ,
                "--no-sandbox" ,
                
              ]
        });
   
      
    const page   = await browser.newPage(); 
    await login(page);
    
    
      for(let i= 0 ; i<pagesfb.length ; i++){
      product =new Product() ;
     
     
     await page.goto(`${url}/${pagesfb[i]}/about` , { waitUntil: 'domcontentloaded' });
     await delay(5000);
     await autoScroll(page);
         // title of pages
         const title = await page.evaluate(() => {
          let name = document.querySelector("div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb.ka73uehy > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div:nth-child(1) > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.taijpn5t.gs1a9yip.owycx6da.btwxx1t3.ihqw7lf3.cddn0xzi > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.on77hlbc.buofh1pr.o8rfisnq.ph5uu5jm.b3onmgus.ihqw7lf3.ecm0bbzt > div > div > div:nth-child(1) > h2 > span > span").textContent ;
           return  name ;
        });
          product.name = title ;
         // total fans
          const fans = await page.evaluate(() => {
          let nombre =   document.querySelector(" div.dwo3fsh8.g5ia77u1.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.q9uorilb.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h.k4urcfbm > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.o8rfisnq.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > div > div > span > span:nth-child(1)").textContent ;
          let ret = nombre.replace('personnes','');
           return ret ;	}); 
           product.totalfans = fans ;
           
         
           // total followres
           const followres = await page.evaluate(() => { 
             if( document.querySelector("div > div:nth-child(2) > div > div:nth-child(3) > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.o8rfisnq.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > div > div > span > span") !== null)
             {nombre =   document.querySelector("div > div:nth-child(2) > div > div:nth-child(3) > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.o8rfisnq.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > div > div > span > span").textContent ;}
              else {nombre =document.querySelector("div.bp9cbjyn.j83agx80.cbu4d94t.d2edcug0 > div > div > div:nth-child(1) > div > div:nth-child(3) > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.o8rfisnq.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > div > div > span > span").textContent ;}
            
             let ret = nombre.replace('personnes sont abonnées','');
             return ret ;	});    
            
           
            
          cron.schedule("* * 1 * *", () => {
           
            fs.writeFileSync(`./files/f${i}.txt`,fans.replace(/\s+/g, ''), function (err) {
            if (err) throw err;
          
             });
          
            
            });
            fs.readFile(`./files/f${i}.txt`, 'utf8', (error, data) => {
              if(error) {
                  throw error;
              }
             let nefans = parseFloat(fans.replace(/\s+/g, '')) -  parseFloat(data.toString().replace(/\s+/g, ''));
              
             product.newfans = nefans ;
             let varnbfans = (nefans / (parseFloat(fans.replace(/\s+/g, ''))* 100)).toFixed(5);
             product.varfans = varnbfans +"%" ;
           
            });
          
        
         
         //number of posts & reactions & comments 
        await page.goto(`${postsfb[i]}`, { waitUntil: 'domcontentloaded' });
         await delay(5000);
         await autoScroll(page);
         
         const  res  = await page.evaluate(() => { 
          function convertir(scrapeV ,somme) {
           
           
             if(isNaN(scrapeV[0]))
            {   plus = scrapeV.split(",").length - 1;
                a = scrapeV.substring(scrapeV.lastIndexOf('et')+2);
                
               
                if ( a.includes('K') )
                { 
                a.replaceAll(',','.');
                likeOrComm =parseFloat(a)*1000 + plus;
                }
                else 
                { likeOrComm =parseFloat(a) + plus ; }

              
              
            }
              else
              if ( scrapeV.includes('K') )
              { 
              scrapeV.replaceAll(',','.');
              likeOrComm =parseFloat(scrapeV)*1000;
              }
              else 
              { likeOrComm =parseFloat(scrapeV) ; }
              
            
              somme += likeOrComm  ;




            
            return somme ;
}
          
          
          var  months = ['janv','févr' ,'mars','avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct' ,'nov' ,'déc'];
          var monthName=months[new Date().getMonth()]; 
          let posts = document.querySelectorAll("div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb.ka73uehy > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div > div > div > div > div > div");
          var result = [0,0,0];
          
          
           for (let j= 1 ; j<= posts.length ; j++) {
             
            let selection1 = document.querySelector(`div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div:nth-child(${j}) > div > div > div > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a > div > div.bp9cbjyn.j83agx80.buofh1pr.hpfvmrgz > div > span > div > span.gpro0wi8.cwj9ozl2.bzsjyuwj.ja2t1vim > span > span`)!== null; 
            let selection =document.querySelector(` div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb.ka73uehy > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div:nth-child(${j}) > div > div > div > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a > div > div.pfnyh3mw > div > span`) !== null ;  
             //let likes = document.querySelector(`div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div:nth-child(${j}) > div > div > div > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a > div > div.bp9cbjyn.j83agx80.buofh1pr.hpfvmrgz > div > span > div > span.gpro0wi8.cwj9ozl2.bzsjyuwj.ja2t1vim > span > span`).textContent; 
             let dateofpost = document.querySelector(`div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div:nth-child(${j}) > div > div > div > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a > a > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.pfnyh3mw.d2edcug0 > div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > span > span > span`).textContent ;
             if (dateofpost.includes(monthName) || dateofpost.includes('Hier') || dateofpost.includes('h') || dateofpost.includes('min'))

            { 
             
              if ( selection)
              { comments = document.querySelector(`div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div:nth-child(${j}) > div > div > div > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a > div > div.pfnyh3mw > div > span`).textContent;}
              else 
              { comments = "0" ;}
              if ( selection1)
              {likes = document.querySelector(`div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div > div:nth-child(${j}) > div > div > div > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a > div > div.bp9cbjyn.j83agx80.buofh1pr.hpfvmrgz > div > span > div > span.gpro0wi8.cwj9ozl2.bzsjyuwj.ja2t1vim > span > span`).textContent; 
            }
              else 
              {likes = "0" ;}
               result[2] = convertir(comments , result[2]);
             
            
                result[1] = convertir(likes , result[1]);
               // 
              result[0]++ ;
            }
         } 

          return  result ;}); 
  


          
         let TE =  (((res[1]+res[2])/ parseFloat(followres.replace(/\s+/g, '')))*100).toFixed(2) ; 
         product.posts = res[0] ;
         product.reactions = res[1] ;
         product.comments = res[2] ;
         product.interactions = res[1]+res[2] ;
         product.TE= TE+"%";

          // store in array list
          let products = [];
      
          products.push(product);
          MongoClient.connect('mongodb+srv://Laith:Azer1234@cluster0.9pyqc.mongodb.net/Data', (err, client) => {
            // Client returned
           var db = client.db('mytestingdb');
          // db.collection("Benchmark").drop();
           if (db.collection("Benchmark").indexExists()) {
            db.collection("Benchmark").insertMany(products, function(err, res) {  
              console.log("connect"+ db)
          
            //  if (err) throw err;  
              console.log("1 record inserted");  
              });  
          
          }
          else {
            db.collection("Benchmark").insertMany(products, function(err, res) {  
              console.log("connect"+ db)
          
            //  if (err) throw err;  
              console.log("1 record inserted");  
              });}
          }) 
          console.log(products);
         

         
         
   
  

      
    
       

   
   
    }
      
   
    await browser.close(); 
  }   
  
  )
(); // end of forloop



function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

Date.prototype.getMonthName = function(lang) {
  // Default language is English
  lang = lang || 'en-GB';
  return this.toLocaleString(lang, {month:'long'});}