const livreSchema = require("../model/livres.model");
const { default: mongoose } = require("mongoose");
const fs = require("fs");


exports.livres_affichage = (requete, reponse) => {
    livreSchema.find()
        .exec()
        .then(livres => {
            reponse.render("livres/liste.html.twig", {liste : livres, message : reponse.locals.message});
        })
        .catch();
}

exports.livres_ajout = (requete, reponse) =>{
    const livre = new livreSchema({
        _id: new mongoose.Types.ObjectId(),
        nom: requete.body.titre,
        auteur: requete.body.auteur,
        pages: requete.body.pages,
        description: requete.body.description,
        image : requete.file.path.substring(14)
    });
    livre.save()
    .then(resultat =>{
        reponse.redirect("/livres");
    })
    .catch(error =>{
        console.log(error);
    })
}

exports.detail_livre = (requete,reponse) =>{
    livreSchema.findById(requete.params.id)
    .exec()
    .then(livre => {
        reponse.render("livres/livre.html.twig", {livre : livre, isModification:false})
    })
    .catch()
}

exports.modification_livre = (requete, reponse) =>{
    livreSchema.findById(requete.params.id)
    .exec()
    .then(livre => {
        reponse.render("livres/livre.html.twig", {livre : livre, isModification:true})
    })
    .catch()
}

exports.modification_server = (requete, reponse) =>{
    const livreUpdate = {
        nom : requete.body.titre,
        auteur : requete.body.auteur,
        pages : requete.body.pages,
        description : requete.body.description
    }
    livreSchema.updateOne({_id:requete.body.identifiant}, livreUpdate)
    .exec()
    .then(resultat =>{
        if (resultat.modifiedCount < 1) throw new Error("Requete de modification échouée");
        requete.session.message = {
            type : 'success',
            contenu : 'Modification effectuée'
        }
        reponse.redirect("/livres");
    })
    .catch(error =>{
        console.log(error);
        requete.session.message = {
            type : 'danger',
            contenu : error.message
        }
        reponse.redirect("/livres");
    })
}

exports.ajout_image = (requete, reponse) => {
    var livre = livreSchema.findById(requete.body.identifiant)
    .select("image")
    .exec()
    .then(livre => {
        fs.unlink("./public/images/"+livre.image, error =>{
            console.log(error);
        })
    });
    const livreUpdate = {
        image : requete.file.path.substring(14)
    }
    livreSchema.updateOne({_id:requete.body.identifiant}, livreUpdate)
    .exec()
    .then(resultat => {
        reponse.redirect("/livres/modification/"+requete.body.identifiant)
    })
    .catch(error =>{
        console.log(error);
    })
}

exports.suppression_livre = (requete, reponse) => {
    var livre = livreSchema.findById(requete.params.id)
    .select("image")
    .exec()
    .then(livre => {
        fs.unlink("./public/images/"+livre.image, error =>{
            console.log(error);
        })

        livreSchema.remove({_id:requete.params.id})
            .exec()
            .then(resultat =>{
                requete.session.message = {
                    type : 'success',
                    contenu : 'Supprimer avec succès'
                }
                reponse.redirect("/livres");
            })
            .catch()
    })
    .catch()
}

exports.user = (requete,reponse,suite) => {
    const error = new Error("Page non trouvée");
    error.status = 404;
    suite("error");
}

exports.erreur = (error,requete,reponse) => {
    reponse.status(error.status || 500);
    reponse.end(error.message);
}