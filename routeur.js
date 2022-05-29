const express = require("express");
const routeur = express.Router();
const twig = require("twig");
const multer  = require('multer');
const livreController = require("./controller/livre.controller");

const storage = multer.diskStorage({
  destination : (requete, file, cb) =>{
    cb(null, "./public/images/")
  },
  filename : (requete, file, cb) =>{
    let date = new Date().toLocaleDateString().replace("/", "-");
    cb(null, date.replace("/", "-") + "-" + Math.round(Math.random() * 10000) + "-" + file.originalname)
  }
});

const fileFilter = (requete, file, cb) =>{
  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
    cb(null, true)
  }else{
    cb(new Error("l'image n'est pas acceptée"),false)
  }
}


const upload = multer({
  storage : storage,
  limits : {
    fileSize : 1024 * 1024 * 5
  }
})

routeur.get("/", (requete, reponse) => {
    reponse.render("accueil.html.twig");
})

routeur.get("/livres", livreController.livres_affichage)

routeur.post("/livres", upload.single("image"), livreController.livres_ajout);


//Afficage détailler d'un livre
routeur.get("/livres/:id", livreController.detail_livre);

//Modification d'un livre (formulaire)
routeur.get("/livres/modification/:id", livreController.modification_livre);

routeur.post("/livres/modificationServer", livreController.modification_server);

routeur.post("/livres/updateImage", upload.single("image"), livreController.ajout_image);

routeur.post("/livres/delete/:id", livreController.suppression_livre);

routeur.use(livreController.user);

routeur.use(livreController.erreur);

module.exports = routeur;