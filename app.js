const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser')

//引入Card.js
// const randomcards=require('./Card');

// const pokers = randomcards.pokers

// const randomCards = randomcards.randomCards 

//引入Card.js,解构复制
const {pokers, randomCards, CardGroup} = require('../class/Public/Card');

//分配的端口
const port=3000;

app.use(express.static('Public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
const windRates = {
    '五同':750,
    '皇家大顺':250,
    '同花顺':150,
    '四同':60,
    '三代对':10,
    '同花':7,
    '顺子':5,
    '三同':3,
    '两对':2,
    '一对':1,
    '未中奖':0,
    //待操作
}

app.get('/',(req,res)=>{
    
    const htmlPath=path.join(__dirname,'Public','index.html');
    res.sendFile(htmlPath);
});

//indexes: []
function genCardGroup(randIdx){//有问题
    cards = new CardGroup();
    randIdx.forEach(id => {
        cards.push(id);//需要修改
    });
    return cards;
}

let gameCoin = 10000;
let gameCards;

app.get('/random',(req,res)=>{
    
    const randIdx=randomCards();//调用函数[0,12,2,14,5]
    gameCards = genCardGroup(randIdx);
    res.json({
        cards:randIdx,//=>{(type:1,vaule:1)}
        result:gameCards.judge(),
    });//返回客户端
});

//下注
app.post('/pour',(req,res)=>{
     
    let coin = req.body.coin || 0
    if( coin < 1){
        res.json({
            code:1,
            desc: '下注金额不能为0'
        })
        return
    }
    if( gameCoin < coin){
        res.json({
            code:1,
            desc: '金额不足'
        })
        return
    }
    pourCoin = coin
    gameCoin -= coin

    res.json({
        code:0,
        currCoin:gameCoin,
        gameStart:true,
    })
})

app.post('/switch',(req,res)=>{
    /*
        keep = [0,1,2]
    */
    let keep  = req.body['keepcard[]']
    for(let i=0;i<req.body.length;i++){
        if(keep[i]=="0"){
            keep[i]=0;
        }else if(keep[i]=="1"){
            keep[i]=1;
        }else if(keep[i]=="2"){
            keep[i]=2;
        }else if(keep[i]=="3"){
            keep[i]=3;
        }else if(keep[i]=="4"){
            keep[i]=4;
        }
    }
    if(!keep){
        keep = [];
    }
    let temp = []
    for(let i=0;i<5;i++){
        let cardtext = false;
        for(let j =0;j<req.body.length;j++){
            if(keep[j]==i){
                cardtext = !cardtext;
                break;
            }
        }
        if(cardtext){
            temp[i]=gameCards[i].cardid;
        }else{
            temp[i]=null;
        }
    }

    gameCards = randomCards(temp)
    
    const cards = genCardGroup(gameCards)
 
    const result = cards.judge()

    const winCoin = (windRates[result] || 0)*req.body.pourCoin

    if(winCoin>0){
        gameCoin+=winCoin
    }else{
        gameCoin=gameCoin
    }
    res.json({
        cards,
        result,
        gameCoin,
        keep,
        temp
    })
})

app.listen(port,()=>{
    console.log('111',port,'00000 ');
});
