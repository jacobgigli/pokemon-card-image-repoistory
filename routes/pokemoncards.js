const router = require('express').Router();
const user = require('../model/User');
const PokemonCard = require('../model/PokemonCard');
const verify = require('./verifyToken');
const multer = require('multer');
const mongoose  = require('mongoose');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')

    },
    filename: function(req, file, cb){
        cb(null, Date.now()+ file.originalname);

    }
});
const upload = multer ({storage: storage});
router.post('/', verify, upload.single('productImage'), async(req,res, next) => {
        const product = new PokemonCard({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            productImage: req.file.path,
            user: req.user._id,
            dateAcquired: new Date()
        });
    product
    .save().then(result =>{
        console.log(result);
        res.status(201).json({
            message: "Handling POST request",
            createdProduct: {
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                user: result.user,
                description: result.description,
                dateAcquired: result.dateAcquired,
                _id: result._id,
                request :{
                    type: 'GET',
                    url: 'http://localhost:3000/api/pokemoncards/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
    

    
});

router.get('/:pokemoncardId', verify, async(req,res, next) => {
   const id = mongoose.Types.ObjectId(mongoose.Types.ObjectId(req.params.pokemoncardId));
    PokemonCard.findById(id).select('-__v').exec().then(doc =>{
        console.log(doc);
        if (doc){
            res.status(200).json(doc);
        }
        else {
            res.status(404).json({message: 'No entry found for provided id'});
        }
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error: err});
    });

});


router.get('/searchbyname/:name', verify, async(req,res, next) => {
    PokemonCard.find().where('name').equals(req.params.name).select('-__v').exec().then(doc =>{
        const response = {
            count: doc.length,
            pokemonCards: doc.map(doc => {
                return{
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    user: doc.user,
                    description: doc.description,
                    dateAcquired: doc.dateAcquired,
                    _id: doc._id,
                    request :{
                        type: 'GET',
                        url: 'http://localhost:3000/api/pokemoncards/' + doc._id
                    }
                }
            })

        }
        
        if (doc.length != 0){
            res.status(200).json(response);
        }
        else {
            res.status(404).json({message: 'No cards found for provided pokemon name'});
        }
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error: err});
    });

 
 });

 router.get('/sortbyfield/:field', verify, async(req,res, next) => {
    if (Math.abs(req.body.order) != 1){
        res.status(400).json({message: 'Invalid sorting paramater'});

    }
    PokemonCard.find().sort([[req.params.field, req.body.order]]).exec().then(doc =>{
        const response = {
            count: doc.length,
            pokemonCards: doc.map(doc => {
                return{
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    user: doc.user,
                    description: doc.description,
                    dateAcquired: doc.dateAcquired,
                    _id: doc._id,
                    request :{
                        type: 'GET',
                        url: 'http://localhost:3000/api/pokemoncards/' + doc._id
                    }
                }
            })

        }
        
        if (doc.length != 0){
            res.status(200).json(response);
        }
        else {
            res.status(404).json({message: 'No cards found for provided pokemon name'});
        }
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error: err});
    });

 
 });



router.get('/getusercards/:userId', verify, async(req,res, next) => {
    PokemonCard.find().where('user').equals(req.params.userId).select('-__v').exec().then(doc =>{
        const response = {
            count: doc.length,
            pokemonCards: doc.map(doc => {
                return{
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    user: doc.user,
                    description: doc.description,
                    dateAcquired: doc.dateAcquired,
                    _id: doc._id,
                    request :{
                        type: 'GET',
                        url: 'http://localhost:3000/api/pokemoncards/' + doc._id
                    }
                }
            })

        }
        
        if (doc.length != 0){
            res.status(200).json(response);
        }
        else {
            res.status(404).json({message: 'No entry found for provided user'});
        }
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error: err});
    });

 
 });

 router.delete('/:pokemoncardId', verify, async(req,res, next) => {
    const id = mongoose.Types.ObjectId(mongoose.Types.ObjectId(req.params.pokemoncardId));
     PokemonCard.remove({_id: id }).exec().then(result =>{
         res.status(200).json(result);
         
         
     })
     .catch(err =>{
         console.log(err);
         res.status(500).json({error: err});
     });
 });
 
 
 router.patch('/:pokemoncardId', verify, async(req,res, next) => {
    const id = mongoose.Types.ObjectId(mongoose.Types.ObjectId(req.params.pokemoncardId));
     await PokemonCard.findByIdAndUpdate(id, {$set: req.body}, {new: true}).exec().then(result =>{
         res.status(200).json({
            result: {
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    user: result.user,
                    description: result.description,
                    dateAcquired: result.dateAcquired,
                    _id: result._id,
                    request :{
                        type: 'GET',
                        url: 'http://localhost:3000/api/pokemoncards/' + result._id
                    
             }
            }
             
         });
         
         
     })
     .catch(err =>{
         console.log(err);
         res.status(500).json({error: err});
     });
 
 });
 
 
 

module.exports = router;