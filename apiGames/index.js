const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');



//Key

const jwtSecret = "123";




app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


function auth(req, res, next) { 
    const authToken = req.headers["authorization"];

    if(authToken != undefined) {
        
        const bearer = authToken.split(" ");
        const token = bearer[1];
        jwt.verify(token,jwtSecret, (err,data)=>{
            if(err){
                res.status(401);
                res.json({err: "Token inválido"})
            }else{
                req.token = token;
                req.loggedUser = {
                    id: data.id, 
                    email: data.email
                }
                req.empresa = "DarkGame"
                next();                
            }
        })

    }else{
        res.status(401)
        res.json({ error: "token inválido"})
    }

    console.log(authToken);
}

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJtYXJjZWxvQGdtYWlsLmNvbSIsImlhdCI6MTU5NTI3MTM1MCwiZXhwIjoxNTk1MzU3NzUwfQ.uMEL46GRicQ4ajjLAX4tyhMIGxjEFrZTa4Wg9YDJ6YI


let db = {
    games: [
        {
           id: 1,
           title: 'Spider Man',
           year: 2020,
           price: 100
        },
        {
           id: 2,
           title: 'Mortal',
           year: 2021,
           price: 60
        },
        {
           id: 3,
           title: 'UFC',
           year: 2022,
           price: 50
        },
        {
           id: 4,
           title: 'FIFA',
           year: 2023,
           price: 110
        },
        {
           id: 5,
           title: 'Resident Evil',
           year: 2024,
           price: 120
        },
        {
           id: 6,
           title: 'NBA',
           year: 2025,
           price: 40
        },
    ],
    users: [
        {
            id: 1,
            name: "Marcelo",
            email: "marcelo@gmail.com",
            password: "123"
        },
        {
            id: 2,
            name: "Walther",
            email: "walther@gmail.com",
            password: "456"
        }
    ]
}

//BUSCANDO GAMES
app.get('/games',auth,(req, res) => {
    
    res.statusCode = 200;
    res.json({empresa: req.empresa,user: req.loggedUser,games: db.games});
});



app.get('/games/:id',auth,(req, res) => {
    let id = parseInt(req.params.id)
        if(isNaN(id)){//isso não é um numero
            res.sendStatus(400);
        }else{
            
        let game = db.games.find((game) => game.id == id);

        if(game != undefined){
            res.statusCode = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }

    }
})

//CADASTRANDO UM GAME 
app.post('/games', (req, res) =>{
    /* let {id, title, price, year} = req.body; */
    let id = req.body.id;
    let title = req.body.title;
    let price = req.body.price;
    let year =  req.body.year;
    
    if(id == undefined || typeof(id) == "string" || title == undefined || title == "" || price == undefined || typeof(price) == "string" || year == undefined || typeof(year) == "string"){
        return res.sendStatus(400)
    }else{
        
        db.games.push({
            id,
            title,
            price,
            year
        });
        res.sendStatus(200)
    }
})

//DELETANDO
app.delete("/games/:id", (req, res) => {
    
    if(isNaN(req.params.id)){
        res.sendStatus(400)
    }else{
        let id = parseInt(req.params.id);

        let index = db.games.findIndex(game => game.id == id);
       
        if(index == -1){
            return res.sendStatus(400)
        }else{
            
            db.games.splice(index, 1);
            return res.sendStatus(200)
        }
    }
})


//EDIÇÃO DE DADOS "PODEMOS UTILIZAR 3 MODOS, POST, PUT, PATCH O MAIS RECOMENDADO É USAR O PUT"
 
app.put('/games/:id',(req, res)=>{

    if(isNaN(req.params.id)){
        res.sendStatus(400)
    }else{
        let id = parseInt(req.params.id);
        let game = db.games.find( game => game.id == id);

        if(game != undefined){
            let{title, price, year} = req.body;

            if(title != undefined){
                game.title = title;
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }
                res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }

    }

})





//ADICIONANDO USUARIOS JWT
// PARA GERAR TOKEN É NECESSARIO PASSAR USUARIO E SENHA NO POSTMAN
// APOS PASSAR USUARIO E SENHA FAZER UMA REQUISIÇÃO NO POSTMAN PARA ESSA ROTA, IR NA ABA AUTHORIZATION E COLOCAR O TOKEN GERADO
// ALTERAR O TOKEN E VERIFICAR SE ACESSOU


app.post("/auth",(req, res)=>{

    let {email,password} = req.body;

    if(email!= undefined && password!= undefined){

       const user = db.users.find(user => user.email == email);
       
       if(user != undefined){

        if(user.password == password){

            jwt.sign({id: user.id, email: user.email}, jwtSecret,{expiresIn:"24h"},(err, token)=>{
                if(err){
                    res.status(400);
                    res.json({error:"Falha Interna"});

                }else{
                    res.status(200);
                    res.json({token:token})
                }
            })
        }else{
            res.status(401);
            res.json({err: "senha invalida"})
        }

       }else{
           res.status(404)
           res.json({err: "Email não encontrado na base de dados"})
       }
    }else{
        res.status(400)
        res.json({err: "O email ou senha, estão invalido"})
    }
})



app.listen(8081,()=>{
    console.log("Api rodando")
})



