//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  
var express = require('express');

// Nous définissons ici les paramètres du serveur.
var hostname = require('https'); 
var port = process.env.PORT || 5000; 

// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'); 
// Ces options sont recommandées par mLab pour une connexion à la base
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

//URL de notre base
var urlmongo = "mongodb://heroku_rc37f26w:1gn8agb6eokrgdlahjm4tdutp8@ds133187.mlab.com:33187/heroku_rc37f26w"; 

// Nous connectons l'API à notre base de données
mongoose.connect(urlmongo, options);

var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 

// Nous créons un objet de type Express. 
var app = express(); 

var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Pour modéliser les données, le framework mongoose utilise des "schémas" ; nous créons donc un modèle de données :
var questionSchema = mongoose.Schema({
  categorie: String, 
  question: String, 

}); 

var Question = mongoose.model('Question', questionSchema);

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 

// Je vous rappelle notre route (/questions).  
myRouter.route('/questions')

.get(function(req,res){ 
  // Utilisation de notre schéma Question pour interrogation de la base
      Question.find(function(err, questions){
          if (err){
              res.send(err); 
          }
          res.json(questions); 
          })
  })

  //POST
.post(function(req,res){
  // Nous utilisons le schéma Question
    var question = new Question();
  // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
    question.categorie = req.body.categorie;
    question.question = req.body.question;

  //Nous stockons l'objet en base
    question.save(function(err){
      if(err){
        res.send(err);
      }
      res.send({message : 'Bravo, la question est maintenant stockée en base de données'});
    })
})

//PUT
.put(function(req,res){ 
  res.json({message : "Mise à jour des informations d'une question dans la liste", methode : req.method});
})

//DELETE
.delete(function(req,res){ 
  res.json({message : "Suppression d'une question dans la liste", methode : req.method});  
  }); 

myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre API FAQ ", methode : req.method});
});

myRouter.route('/questions/:question_id')
.get(function(req,res){ 
          //Mongoose prévoit une fonction pour la recherche d'un document par son identifiant
          Question.findById(req.params.question_id, function(err, question) {
          if (err)
              res.send(err);
          res.json(question);
      });
})

.put(function(req,res){ 
  // On commence par rechercher la question souhaitée
              Question.findById(req.params.question_id, function(err, question) {
              if (err){
                  res.send(err);
              }
                  // Mise à jour des données de la question
                      question.categorie = req.body.categorie;
                      question.question = req.body.question;
                            question.save(function(err){
                              if(err){
                                res.send(err);
                              }
                              // Si tout est ok
                              res.json({message : 'Bravo, mise à jour des données OK'});
                            });                
              });
})

.delete(function(req,res){ 
 
  Question.remove({_id: req.params.question_id}, function(err, question){
      if (err){
          res.send(err); 
      }
      res.json({message:"Bravo, question supprimée"}); 
  }); 
  
});

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  

// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});




